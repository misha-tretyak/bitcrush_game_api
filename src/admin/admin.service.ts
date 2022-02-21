import { Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { GameRoll } from "../game-rolls/game-rolls.model";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { Setting } from "../settings/settings.model";
import { User } from "../users/users.model";
import { DragonGame } from "../dragon-games/dragon-games.model";
import * as Config from "../config";
import sequelize, { cast, QueryTypes } from "sequelize";
import { Sequelize } from "sequelize-typescript";

const Web3 = require("web3");
const { Op } = require("sequelize");

@Injectable()
export class AdminService {
  constructor(
    @InjectModel(GameRoll) private readonly gameRollRepository: typeof GameRoll,
    @InjectModel(DragonGame)
    private readonly dragonGameRepository: typeof DragonGame,
    @InjectModel(BancrollSetting)
    private readonly bankrollSettingRepository: typeof BancrollSetting,
    @InjectModel(Setting) private readonly settingRepository: typeof Setting,
    @InjectModel(User) private readonly usersRepository: typeof User,
    private readonly db: Sequelize
  ) {}

  private logger: Logger = new Logger("AdminService");
  provider = new Web3.providers.HttpProvider(process.env.NODE_URL);
  web3 = new Web3(this.provider);
  bankroll = new this.web3.eth.Contract(
    Config.config.bankroll.abi,
    Config.config.bankroll.address
  );
  staging = new this.web3.eth.Contract(
    Config.config.staging.abi,
    Config.config.staging.address
  );

  async get_dragon_games_profit(fromDate: Date, toDate: Date) {
    try {
      const all_profit = await this.dragonGameRepository.sum("profit", {
        where: {
          profit: { [Op.lt]: 0 },
          createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
        },
      });
      const user_wins = await this.dragonGameRepository.sum("profit", {
        where: {
          profit: { [Op.gt]: 0 },
          createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
        },
      });
      const user_losses = await this.dragonGameRepository.sum("profit", {
        where: {
          profit: { [Op.lt]: 0 },
          createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
        },
      });
      const net_profit = Math.abs(user_losses) - user_wins;

      return {
        all_profit: Math.abs(all_profit),
        net_profit,
      };
    } catch (err) {
      this.logger.error(err, "Error Get Dragon Games Profit");
    }
  }

  async card_number_of_players(fromDate: Date, toDate: Date) {
    try {
      let prevDate = new Date(
        new Date(fromDate).getTime() -
          (new Date(toDate).getTime() - new Date(fromDate).getTime())
      );
      const number_of_players = await this.usersRepository.count({
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const number_of_players_prev = await this.usersRepository.count({
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });

      return {
        number_of_players: number_of_players,
        number_of_players_ptc: this.calcPercent(
          number_of_players_prev,
          number_of_players
        ),
      };
    } catch (err) {
      this.logger.debug(err, "Error card num of players");
    }
  }

  async card_total_bet(fromDate: Date, toDate: Date) {
    try {
      let prevDate = new Date(
        new Date(fromDate).getTime() -
          (new Date(toDate).getTime() - new Date(fromDate).getTime())
      );
      const total_dice_bet = await this.gameRollRepository.count({
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const total_dragon_bet = await this.dragonGameRepository.count({
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const total_dice_bet_prev = await this.gameRollRepository.count({
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });
      const total_dragon_bet_prev = await this.dragonGameRepository.count({
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });

      const total_bet = total_dice_bet + total_dragon_bet;
      const total_bet_prev = total_dice_bet_prev + total_dragon_bet_prev;

      const total_profit_dice = await this.gameRollRepository.sum("profit", {
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const total_profit_dice_prev = await this.gameRollRepository.sum(
        "profit",
        {
          where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
        }
      );
      const total_profit_dragon = await this.dragonGameRepository.sum(
        "profit",
        {
          where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
        }
      );
      const total_profit_dragon_prev = await this.dragonGameRepository.sum(
        "profit",
        {
          where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
        }
      );

      const avg_profit =
        (total_profit_dice + total_profit_dragon) /
        (total_dice_bet + total_dragon_bet);
      const avg_profit_prev =
        (total_profit_dice_prev + total_profit_dragon_prev) /
        (total_dice_bet_prev + total_dragon_bet_prev);

      return {
        total_bet,
        avg_profit,
        total_bet_ptc: this.calcPercent(total_bet_prev, total_bet),
        avg_profit_ptc: this.calcPercent(avg_profit_prev, avg_profit),
      };
    } catch (err) {
      this.logger.debug(err, "Error card total bet");
    }
  }

  async card_total_bankroll() {
    try {
      let total_bankroll = await this.bankroll.methods.totalBankroll().call();
      let staging = await this.staging.methods.totalStaked().call();
      staging = this.web3.utils.fromWei(staging.toString());
      total_bankroll = this.web3.utils.fromWei(total_bankroll.toString());
      total_bankroll = Number(total_bankroll) + Number(staging);

      const house_ptc = await this.bankrollSettingRepository.findOne({
        where: { key: "house_ptc" },
      });
      const investors_ptc = await this.bankrollSettingRepository.findOne({
        where: { key: "investors_ptc" },
      });

      const house_bankroll = (+house_ptc.value / 100) * total_bankroll;
      const investors_bankroll = (+investors_ptc.value / 100) * total_bankroll;
      return {
        total_bankroll,
        house_bankroll,
        investors_bankroll,
      };
    } catch (err) {
      this.logger.debug(err, "Error card bankroll");
    }
  }

  async card_total_wagered(fromDate: Date, toDate: Date) {
    try {
      let prevDate = new Date(
        new Date(fromDate).getTime() -
          (new Date(toDate).getTime() - new Date(fromDate).getTime())
      );

      const total_wagered: { total_bet }[] = await this.db.query(
        `
                    SELECT SUM((bet + COALESCE(color_bet, 0) + COALESCE(type_bet, 0))) AS total_bet
                    FROM game_rolls
                    WHERE "createdAt" >= ?
                      AND "createdAt" <= ?
				`,
        {
          replacements: [fromDate, toDate],
          type: QueryTypes.SELECT,
        }
      );

      const total_wagered_prev: { total_bet }[] = await this.db.query(
        `
                    SELECT SUM((bet + COALESCE(color_bet, 0) + COALESCE(type_bet, 0))) AS total_bet
                    FROM game_rolls
                    WHERE "createdAt" >= ?
                      AND "createdAt" <= ?
				`,
        {
          replacements: [prevDate, fromDate],
          type: QueryTypes.SELECT,
        }
      );

      return {
        total_wagered: total_wagered[0].total_bet,
        total_wagered_ptc: this.calcPercent(
          total_wagered_prev[0].total_bet,
          total_wagered[0].total_bet
        ),
      };
    } catch (err) {
      this.logger.debug(err, "Error card wagered");
    }
  }

  async card_ath_net_profit(fromDate: Date, toDate: Date) {
    try {
      let prevDate = new Date(
        new Date(fromDate).getTime() -
          (new Date(toDate).getTime() - new Date(fromDate).getTime())
      );

      const ath_dice = await this.gameRollRepository.max("profit", {
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const ath_dice_prev = await this.gameRollRepository.max("profit", {
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });
      const ath_dragon = await this.dragonGameRepository.max("profit", {
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const ath_dragon_prev = await this.dragonGameRepository.max("profit", {
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });
      const ath_profit = ath_dragon > ath_dice ? ath_dragon : ath_dice;
      const ath_profit_prev =
        ath_dragon_prev > ath_dice_prev ? ath_dragon_prev : ath_dice_prev;
      const net_profit_dice = await this.gameRollRepository.sum("profit", {
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const net_profit_dice_prev = await this.gameRollRepository.sum("profit", {
        where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
      });
      const net_profit_dragon = await this.dragonGameRepository.sum("profit", {
        where: { createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate } },
      });
      const net_profit_dragon_prev = await this.dragonGameRepository.sum(
        "profit",
        {
          where: { createdAt: { [Op.gte]: prevDate, [Op.lte]: fromDate } },
        }
      );
      const net_profit = (net_profit_dice + net_profit_dragon) * -1;
      const net_profit_prev =
        (net_profit_dice_prev + net_profit_dragon_prev) * -1;

      return {
        ath_profit,
        net_profit,
        ath_profit_ptc: this.calcPercent(
          ath_profit_prev as number,
          ath_profit as number
        ),
        net_profit_ptc: this.calcPercent(net_profit_prev, net_profit),
      };
    } catch (err) {
      this.logger.debug(err, "Error card ath net_profit");
    }
  }

  async topTen(fromDate: Date, toDate: Date, order: "ASC" | "DESC") {
    try {
      fromDate = new Date(fromDate);
      toDate = new Date(toDate);

      return this.usersRepository.findAll({
        where: {
          createdAt: { [Op.gte]: fromDate, [Op.lte]: toDate },
        },
        attributes: [
          "id",
          "wallet_address",
          "createdAt",
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("game_rolls.profit")),
              0
            ),
            "total_profit",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("COUNT", sequelize.col("game_rolls.id")),
              0
            ),
            "total_bet",
          ],
        ],
        include: {
          model: GameRoll,
          attributes: [],
          as: "game_rolls",
          required: false,
          duplicating: false,
        },
        order: [
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("game_rolls.profit")),
              0
            ),
            order,
          ],
        ],
        group: ["User.id"],
        limit: 10,
      });
    } catch (err) {
      this.logger.debug(err, "Error Top Ten");
    }
  }

  async lastGames(query: {
    offset: string;
    limit: string;
    order: "ASC" | "DESC";
    column: string;
    fromDate?: Date;
    toDate?: Date;
    search?: string;
  }) {
    try {
      const { offset: off, limit: lim } = this.calculatePagination(
        query.limit,
        query.offset
      );
      const games = await this.gameRollRepository.findAndCountAll({
        attributes: [
          "id",
          "user_id",
          "bet",
          "color_bet",
          "type_bet",
          "profit",
          "createdAt",
        ],
        where: {
          ...(query?.fromDate && query?.toDate
            ? {
                createdAt: { [Op.gte]: query.fromDate, [Op.lte]: query.toDate },
              }
            : {}),
          ...(query.search.indexOf("0x") === -1
            ? {
                [Op.or]: [
                  sequelize.where(
                    sequelize.cast(sequelize.col("GameRoll.id"), "varchar"),
                    {
                      [Op.substring]: query.search,
                    }
                  ),
                ],
              }
            : {}),
        },
        order:
          query.column === "user"
            ? [[query.column, "wallet_address", query.order]]
            : query.column === "total_bet"
            ? [
                ["bet", query.order],
                ["color_bet", query.order],
                ["type_bet", query.order],
              ]
            : [[query.column, query.order]],
        include: {
          model: User,
          attributes: ["wallet_address"],
          where: {
            ...(query.search.indexOf("0x") !== -1
              ? {
                  [Op.or]: [
                    {
                      wallet_address: { [Op.substring]: query.search },
                    },
                  ],
                }
              : {}),
          },
        },
        limit: lim,
        offset: off,
      });
      const pages = Math.ceil(games.count / lim);
      const currentPage = off / lim + 1;
      return {
        pages,
        currentPage,
        nextPage:
          currentPage < pages
            ? currentPage + 1
            : currentPage >= pages
            ? null
            : null,
        prevPage:
          currentPage >= pages
            ? pages - 1
            : currentPage <= 0
            ? null
            : currentPage < pages
            ? currentPage - 1
            : null,
        firstPage: 1,
        lastPage: pages,
        data: [...games.rows],
        items: games.count,
      };
    } catch (err) {
      this.logger.debug(err, "Error card last games");
    }
  }

  async getAllUsers(query: {
    offset: string;
    limit: string;
    order: "ASC" | "DESC";
    column: string;
    fromDate: Date;
    toDate: Date;
    search?: string;
  }) {
    try {
      const { offset: off, limit: lim } = this.calculatePagination(
        query.limit,
        query.offset
      );

      const users = await this.usersRepository.findAndCountAll({
        attributes: [
          "id",
          "wallet_address",
          "status",
          "balance",
          "createdAt",
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("SUM", sequelize.col("game_rolls.profit")),
              0
            ),
            "total_profit",
          ],
          [
            sequelize.fn(
              "COALESCE",
              sequelize.fn("COUNT", sequelize.col("game_rolls.id")),
              0
            ),
            "total_bet",
          ],
        ],
        where: {
          ...(query?.fromDate && query?.toDate
            ? {
                createdAt: { [Op.gte]: query.fromDate, [Op.lte]: query.toDate },
              }
            : {}),
          ...(query?.search
            ? {
                [Op.or]: [
                  { wallet_address: { [Op.substring]: query.search } },
                  sequelize.where(
                    sequelize.cast(sequelize.col("User.id"), "varchar"),
                    {
                      [Op.substring]: query.search,
                    }
                  ),
                ],
              }
            : {}),
        },
        include: {
          model: GameRoll,
          attributes: [],
          as: "game_rolls",
          required: false,
          duplicating: false,
        },
        order: [
          query.column === "total_bet"
            ? [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("COUNT", sequelize.col("game_rolls.id")),
                  0
                ),
                query.order,
              ]
            : query.column === "total_profit"
            ? [
                sequelize.fn(
                  "COALESCE",
                  sequelize.fn("SUM", sequelize.col("game_rolls.profit")),
                  0
                ),
                query.order,
              ]
            : [query.column, query.order],
        ],
        group: ["User.id"],
        limit: lim,
        offset: off,
      });
      const pages = Math.ceil(users.count / lim);
      const currentPage = off / lim + 1;

      return {
        pages,
        currentPage,
        nextPage:
          currentPage < pages
            ? currentPage + 1
            : currentPage >= pages
            ? null
            : null,
        prevPage:
          currentPage >= pages
            ? pages - 1
            : currentPage <= 0
            ? null
            : currentPage < pages
            ? currentPage - 1
            : null,
        firstPage: 1,
        lastPage: pages,
        data: [...users.rows],
        // @ts-ignore
        items: users?.count?.length,
      };
    } catch (err) {
      this.logger.debug(err, "Error GET ALL USERS");
    }
  }

  async getUserDetails(wallet_address: string) {
    try {
      const user = await this.usersRepository.findOne({
        attributes: [
          "wallet_address",
          "balance",
          "id",
          "enabled_2fa",
          "username",
          "createdAt",
        ],
        where: { wallet_address },
      });
      const user_total_dice_bets = await this.gameRollRepository.count({
        where: { user_id: user.id },
      });

      const user_total_dragon_bets = await this.dragonGameRepository.count({
        where: { wallet_address: user.wallet_address },
      });

      const bets = await this.gameRollRepository.sum("bet", {
        where: {
          user_id: user.id,
        },
      });
      const color_bets = await this.gameRollRepository.sum("color_bet", {
        where: {
          user_id: user.id,
        },
      });
      const type_bets = await this.gameRollRepository.sum("type_bet", {
        where: {
          user_id: user.id,
        },
      });

      const total_wagered = type_bets + color_bets + bets;

      const total_bets = user_total_dice_bets + user_total_dragon_bets;

      return {
        createdAt: user.createdAt,
        username: user.username,
        balance: user.balance,
        wallet_address: user.wallet_address,
        total_wagered,
        total_bets,
      };
    } catch (e) {
      this.logger.error(e);
      return "User with this address not found!";
    }
  }

  async blockUser(wallet_address: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { wallet_address },
      });
      user.status = 0;
      await user.save();
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false };
    }
  }

  async unblockUser(wallet_address: string) {
    try {
      const user = await this.usersRepository.findOne({
        where: { wallet_address },
      });
      user.status = 1;
      await user.save();
      return { success: true };
    } catch (e) {
      this.logger.error(e);
      return { success: false };
    }
  }

  async chartDataPlayers(
    fromDate: Date,
    toDate: Date,
    point: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR"
  ) {
    try {
      return await this.db.query(
        `
                    SELECT COUNT(id)                  AS users,
                           date_trunc(?, "createdAt") AS date
                    FROM users
                    WHERE "createdAt" >= ?
                      AND "createdAt" <= ?
                    GROUP BY date_trunc(?, "createdAt")
                    ORDER BY date_trunc(?, "createdAt") ASC`,
        {
          replacements: [point, fromDate, toDate, point, point],
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      this.logger.debug(err, "Error Get Chart Data Players!");
    }
  }

  async chartDataGames(
    fromDate: Date,
    toDate: Date,
    point: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR"
  ) {
    try {
      return await this.db.query(
        `
                    SELECT ROUND(SUM(profit)::numeric, 4) AS net_profit,
                           ROUND(MAX(profit)::numeric, 4) AS max_profit,
                           ROUND(AVG(profit)::numeric, 4) AS avg_profit,
                           ROUND(SUM((bet + COALESCE(color_bet, 0) + COALESCE(type_bet, 0)))::numeric,
                                 4)                       AS total_wagered,
                           COUNT(bet)                     AS total_bet,
                           date_trunc(?, "createdAt")     AS date
                    FROM game_rolls
                    WHERE "createdAt" >= ?
                      AND "createdAt" <= ?
                    GROUP BY date_trunc(?, "createdAt")
                    ORDER BY date_trunc(?, "createdAt") ASC`,
        {
          replacements: [point, fromDate, toDate, point, point],
          type: QueryTypes.SELECT,
        }
      );
    } catch (err) {
      this.logger.debug(err, "Error Get Chart Data Games!");
    }
  }

  async changeGeneralUserSettings(
    wallet_address: string,
    enabled_2fa: boolean,
    email: string,
    username: string
  ) {
    try {
      const user = await this.usersRepository.findOne({
        where: { wallet_address },
        attributes: [
          "id",
          "enabled_2fa",
          "wallet_address",
          "email",
          "username",
        ],
      });
      user.enabled_2fa = enabled_2fa;
      user.email = email;
      user.username = username;
      await user.save();
      return user;
    } catch (err) {
      this.logger.debug(err, "Error saving user from admin general!");
    }
  }

  calcPercent(a: number, b: number): number {
    if (!a) {
      a = 1;
    }
    return Number((((b - a) * 100) / a).toFixed(2));
  }

  calculatePagination = (lim: string, off: string) => {
    let limit = null;
    let offset = +off - 1 > 0 ? +off - 1 : 0;
    if (lim && typeof +lim === "number" && +lim > 0) limit = +lim;
    if (limit && offset && typeof offset === "number" && offset > 0)
      offset *= limit;
    if (!lim && !off) {
      return {
        limit: 25,
        offset: 0,
      };
    }
    return {
      limit,
      offset,
    };
  };
}
