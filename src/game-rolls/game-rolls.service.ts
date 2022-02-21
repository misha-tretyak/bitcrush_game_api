import {
  Injectable,
  Inject,
  HttpException,
  HttpStatus,
  CACHE_MANAGER,
  forwardRef,
  Logger,
} from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Cache } from "cache-manager";
import { UpdateGameRollDto } from "./dto/update-game-roll.dto";
import { GameRoll } from "./game-rolls.model";
import { UserSeed } from "../user-seeds/user-seeds.model";
import { ValidationException } from "../exceptions/validation.exception";
import { User } from "src/users/users.model";
import { GameSetting } from "src/game-settings/game-settings.model";
import { CreateRollDto } from "./dto/create-roll.dto";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { UsersService } from "src/users/users.service";
import { Setting } from "src/settings/settings.model";
import { Sequelize } from "sequelize-typescript";
const { Op } = require("sequelize");
import {
  IRollResult,
  IMainBetResults,
  IPaginateStats,
  ILeaderboards,
  IStats,
  ISaveUserRoll,
  IMinMax,
} from "src/interfaces";
import * as Config from "../config.js";
import { DragonGame } from "../dragon-games/dragon-games.model";
import { TempProfit } from "../temp-profit/temp-profit.model";
import { BigNumber } from "bignumber.js";

const util = require('util');
import { RedisClient } from "redis";
const redis = new RedisClient({ host: "localhost", port: 6379 });
let temp_profit = 0;

const crypto = require("crypto");
const Web3 = require("web3");
let transaction: any = false;

@Injectable()
export class GameRollsService {
  constructor(
    @InjectModel(GameRoll) private readonly gameRollRepository: typeof GameRoll,
    @InjectModel(DragonGame)
    private readonly dragonGameRollRepository: typeof DragonGame,
    @InjectModel(GameSetting)
    private readonly gameSettingRepository: typeof GameSetting,
    @InjectModel(UserSeed) private readonly userSeedRepository: typeof UserSeed,
    @InjectModel(TempProfit)
    private readonly tempProfitRepository: typeof TempProfit,
    @InjectModel(User) private readonly userRepository: typeof User,
    @InjectModel(BancrollSetting)
    private readonly bankrollSettingRepository: typeof BancrollSetting,
    @InjectModel(Setting) private readonly settingRepository: typeof Setting,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject(forwardRef(() => UsersService))
    private readonly userService: UsersService,
    private readonly sequelize: Sequelize
  ) { }

  private logger: Logger = new Logger("GameRollService");
  provider = new Web3.providers.HttpProvider(process.env.NODE_URL);
  web3 = new Web3(this.provider);

  bankroll = new this.web3.eth.Contract(
    Config.config.bankroll.abi,
    Config.config.bankroll.address
  );
  live_wallet = new this.web3.eth.Contract(
    Config.config.live_wallet.abi,
    Config.config.live_wallet.address
  );
  staging = new this.web3.eth.Contract(
    Config.config.staging.abi,
    Config.config.staging.address
  );

  async saveUserRoll(
    createRollDto: CreateRollDto,
    rollResults: IRollResult,
    userSeed: UserSeed,
    nextRollNumber: number
  ) {
    try {
      const user = await this.userRepository.findOne({
        where: { id: createRollDto.user_id },
      });
      const rollResult = rollResults.result;
      let typeResult = Math.floor(rollResult / 5);
      let colorResult = rollResult.toFixed(2);
      colorResult = colorResult[colorResult.length - 1];
      let max_win_reached: boolean = false;
      const mainBet = createRollDto.mainBet;
      let selectedColor = createRollDto.selectedColor;
      let selectedType = createRollDto.selectedType;
      const selectedRange = createRollDto.selectedRange;
      let typeBet = createRollDto.typeBet;
      let colorBet = createRollDto.colorBet;
      const isAuto = createRollDto.isAuto === true;

      let typeProfit = 0,
        colorProfit = 0;

      let playerEdge = await this.getPlayerEdge();

      let mainBetResults: IMainBetResults = this.getMainBetResults(
        selectedRange,
        rollResult,
        playerEdge,
        mainBet
      );

      // Side bets
      if (selectedColor !== null && selectedColor !== undefined && colorBet) {
        colorProfit = await this.getColorBetResults(
          selectedColor,
          Number(colorResult),
          colorBet
        );
      } else {
        selectedColor = colorBet = null;
      }

      if (selectedType !== null && selectedType !== undefined && typeBet) {
        typeProfit = await this.getTypeBetResults(
          selectedType,
          typeResult,
          typeBet
        );
      } else {
        selectedType = typeBet = null;
      }

      let maxWin = await this.getMaxWin();

      let profit: number = +(
        mainBetResults.profit +
        colorProfit +
        typeProfit
      ).toFixed(4);

      if (maxWin && profit > maxWin) {
        profit = maxWin;
        max_win_reached = true;
      }

      const isWinner = profit >= 0.0;

      let housePartPtc = await this.getHousePtc();
      let investorsPartPtc = await this.getInvestorsPtc();

      if (housePartPtc === null || investorsPartPtc === null) {
        throw HttpStatus.INTERNAL_SERVER_ERROR;
      }

      const houseAndInvestorsPart = await this.calcHouseAndInvestorsPart(
        user,
        profit,
        housePartPtc,
        isWinner
      );
      const potentialProfit = this.userService.makePotentialProfitValue(
        houseAndInvestorsPart.userFundsDecimal,
        houseAndInvestorsPart.newBonusFundsDecimal
      );

      const currentRoll = new GameRoll({
        user_id: user.id,
        user_seed_id: userSeed.id,
        bet_number: nextRollNumber,
        bet: mainBet,
        color_bet: colorBet,
        type_bet: typeBet,
        invader_color: selectedColor,
        invader_type: selectedType,
        selected_range: selectedRange,
        is_winner: isWinner,
        roll_result: rollResult,
        invader_color_result: Number(colorResult),
        roll_hash: rollResults.hash,
        profit_main: +mainBetResults.profit,
        profit_color: colorProfit,
        profit_type: typeProfit,
        profit: profit,
        payout: mainBetResults.multiplier,
        house_part_profit: 0,
        investors_part_profit: 1,
        potential_profit: potentialProfit,
        is_auto: isAuto,
      });

      await currentRoll.save();
      await this.userRepository.increment(
        { balance: profit },
        {
          where: {
            wallet_address: user.wallet_address
          }
        });
      user.balance = user.balance + profit;
      //const savedUser: User = await user.save();

      return { roll: currentRoll, user: user, max_win_reached };
    } catch (err) {
      this.logger.debug(err, "Save Roll Error");
    }
  }

  async roll(body: CreateRollDto) {
    try {
      const increase_ptc = await this.gameSettingRepository.findOne({
        where: { key: "sync_balance_increase_ptc" },
      });
      const decrease_ptc = await this.gameSettingRepository.findOne({
        where: { key: "sync_balance_decrease_ptc" },
      });
      const user = await this.userRepository.findOne({
        where: { id: body.user_id },
      });
      const userSeed = await this.userSeedRepository.findOne({
        where: { id: body.user_seed_id, is_active: true },
      });
      const minBet = await this.gameSettingRepository.findOne({
        where: { key: "min_bet" },
      });
      const side_bet_multiplier_ptc = await this.gameSettingRepository.findOne({
        where: { key: "side_bet_multiplier" },
      });

      let rolllResults: ISaveUserRoll | any;
      let maxBet = await this.getMaxBet();

      let betDecimal = body.mainBet;
      const side_bet_multiplier =
        betDecimal * Number(side_bet_multiplier_ptc.value);

      if (body.selectedColor !== null && body.selectedColor !== undefined) {
        if (side_bet_multiplier > body.colorBet || 1 > body.colorBet) {
          this.logger.debug(body.mainBet, "MAIN BET");
          this.logger.debug(body.colorBet, "TYPE BET");
          this.logger.debug(side_bet_multiplier, "side_bet_multiplier");
          throw new ValidationException(
            `Your side bet is smaller than allowed: 1 CC or 25% from your main bet`
          );
        }
        betDecimal = betDecimal + body.colorBet;
      }

      if (body.selectedType !== null && body.selectedType !== undefined) {
        if (side_bet_multiplier > body.typeBet || 1 > body.typeBet) {
          this.logger.debug(body.mainBet, "MAIN BET");
          this.logger.debug(body.typeBet, "TYPE BET");
          this.logger.debug(side_bet_multiplier, "side_bet_multiplier");
          throw new ValidationException(
            `Your side bet is smaller than allowed: 1 CC or 25% from your main bet`
          );
        }
        betDecimal = betDecimal + body.typeBet;
      }

      if (!betDecimal) {
        throw new ValidationException("Please provide main Bet");
      } else if (user.balance < betDecimal) {
        throw new ValidationException("No enough balance to make next Roll");
      } else if (!userSeed) {
        throw new ValidationException("Seed Error");
      } else if (+maxBet < betDecimal) {
        throw new ValidationException({
          error: `Your bet is larger than allowed: ${maxBet} CC`,
          maxBetReached: true,
          maxBet,
        });
      } else if (+minBet.value > betDecimal) {
        this.logger.error(
          `Your bet is smaller than allowed: ${minBet.value} CC`
        );
        throw new ValidationException(
          `Your bet is smaller than allowed: ${minBet.value} CC`
        );
      } else {
        const countRolls = await this.gameRollRepository.count({
          where: { user_seed_id: userSeed.id },
        });

        const nextRollNumber = countRolls + 1;

        let rollResult = this.getNextRollResult(
          nextRollNumber,
          userSeed.server_seed_private,
          userSeed.client_seed
        );
        try {
          rolllResults = await this.saveUserRoll(
            body,
            rollResult,
            userSeed,
            nextRollNumber
          );

          let temp_user_profit = await this.tempProfitRepository.findOne({
            where: { wallet: user.wallet_address },
          });
          let profitInWei = this.web3.utils.toWei(rolllResults?.roll?.profit.toString());
          if (temp_user_profit) {
            await this.tempProfitRepository.increment({
              profit: profitInWei
            }, {
              where: { wallet: user.wallet_address }
            });
            /* temp_user_profit.profit =
              temp_user_profit.profit + rolllResults?.roll?.profit;
            await temp_user_profit.save(); */
          } else {
            await this.tempProfitRepository.create({
              wallet: user.wallet_address,
              profit: profitInWei
            });
          }

          temp_profit += rolllResults?.roll?.profit;
          let bankroll;
          let staging;
          let frozen;
          let total_bankroll;

          bankroll = await this.bankroll.methods.totalBankroll().call();
          staging = await this.staging.methods.totalStaked().call();
          frozen = await this.staging.methods.totalFrozen().call();

          bankroll = this.web3.utils.fromWei(bankroll.toString());
          staging = this.web3.utils.fromWei(staging.toString());
          frozen = this.web3.utils.fromWei(frozen.toString());

          total_bankroll =
            Number(bankroll) + (Number(staging) - Number(frozen));

          const decrease = (total_bankroll * +decrease_ptc.value) / 100;
          const increase = (total_bankroll * +increase_ptc.value) / 100;

          if (temp_profit > 0 && temp_profit >= decrease) {
            if (!transaction) {
              this.logger.debug(
                "SYNC BALANCES WHEN TRIGGERED ",
                decrease_ptc.value + " %"
              );
              this.sendDataToBlockchain().catch((err) => {
                this.logger.error(
                  err,
                  "ERROR SYNC BALANCES WHEN TRIGGERED ",
                  decrease_ptc.value + " %"
                );
              });
              temp_profit = 0;
            }
          }
          if (temp_profit < 0 && Math.abs(temp_profit) >= increase) {
            if (!transaction) {
              this.logger.debug(
                "SYNC BALANCES WHEN TRIGGERED ",
                increase_ptc.value + " %"
              );
              this.sendDataToBlockchain().catch((err) => {
                this.logger.error(
                  err,
                  "ERROR SYNC BALANCES WHEN TRIGGERED ",
                  increase_ptc.value + " %"
                );
              });
              temp_profit = 0;
            }
          }
        } catch (e) {
          throw new ValidationException(
            `${e} |||  Deposit is not yet confirmed. It can take anywhere from 2-4 confirmations before deposit is confirmed on the blockchain. Please check transaction hash to determine remaining time`
          );
        }

        let currentProfit = await this.gameRollRepository.sum("profit");
        currentProfit = Math.abs(Number(currentProfit.toFixed(2))) ?? 0;
        let savedProfit = await this.settingRepository.findOne({
          where: { key: "max_profit" },
        });

        if (+savedProfit.value < currentProfit) {
          await this.settingRepository.update(
            { value: currentProfit.toString() },
            { where: { key: "max_profit" } }
          );
        }

        return rolllResults;
      }
    } catch (err) {
      this.logger.debug(err, "Roll Error");
      throw new ValidationException(err.message);
    }
  }

  findAll() {
    return this.gameRollRepository.findAll();
  }

  async addTempProfit(profit: number, wallet_address: string) {
    console.log("update temp profit:" + profit, wallet_address);
    let temp_user_profit = await this.tempProfitRepository.findOne({
      where: { wallet: wallet_address },
    });
    let profitInWei = this.web3.utils.toWei(profit.toString());
    if (temp_user_profit) {
      await this.tempProfitRepository.increment({
        profit: profitInWei
      }, {
        where: { wallet: wallet_address }
      });
    } else {
      await this.tempProfitRepository.create({
        wallet: wallet_address,
        profit: profitInWei,
      });
    }
    temp_profit += profit;
    return;
  }

  async updateBlockUsersTime(time: number) {
    try {
      let blockchainTime: number = await this.live_wallet.methods
        .lockPeriod()
        .call();
      if (time !== Number(blockchainTime) && !transaction) {
        transaction = true;
        let txObject: any;
        let gasPrice = await this.web3.eth.getGasPrice();

        txObject = {
          from: process.env.ADMIN_ADDRESS,
          to: process.env.LIVE_WALLET_ADDRESS,
          gasPrice: gasPrice ? gasPrice : this.web3.utils.toWei("20", "Gwei"),
          data: this.live_wallet.methods.setLockPeriod(time).encodeABI(),
        };

        let txValidated = false;
        try {
          let estimatedGas = await this.web3.eth.estimateGas(txObject);
          if (estimatedGas) {
            txObject.gasLimit = Math.ceil(estimatedGas * 1.5);
            txValidated = true;
          }
        } catch (error) {
          transaction = false;
          console.log("estimatedGas error: ", error);
          setTimeout(async () => await this.updateBlockUsersTime(time), 5000);
        }

        if (!txValidated) {
          return;
        }

        const signedTxObject = await this.web3.eth.accounts.signTransaction(
          txObject,
          process.env.SECRET_ACCOUNT
        );
        let tx;
        try {
          tx = await this.web3.eth.sendSignedTransaction(
            signedTxObject.raw || signedTxObject.rawTransaction
          );
          this.logger.log(
            "SUCCESS. BLOCK WITHDRAW TIME CHANGED ON BLOCKCHAIN!"
          );
          transaction = false;
          return tx;
        } catch (error) {
          transaction = false;
          this.logger.error(
            "ERROR BLOCK WITHDRAW TIME CHANGED ON BLOCKCHAIN!",
            error.message
          );
          setTimeout(async () => await this.updateBlockUsersTime(time), 5000);
          return false;
        }
      } else {
        return await this.updateBlockUsersTime(time);
      }
    } catch (err) {
      transaction = false;
      this.logger.debug(err, "Error Update Block Users Time");
    }
  }

  async findAllWhoPlay(time: number) {
    try {
      const newDate = new Date(Date.now());
      newDate.setTime(newDate.getTime() - time);
      let res = [];
      const games_dice = await this.gameRollRepository.findAll({
        where: { createdAt: { [Op.gte]: newDate } },
        include: {
          model: User,
          attributes: ["wallet_address"],
        },
      });
      const games_dragon = await this.dragonGameRollRepository.findAll({
        where: { createdAt: { [Op.gte]: newDate } },
      });
      games_dice.map((game) => res.push(game.user.wallet_address));
      games_dragon.map((game) => res.push(game.wallet_address));

      return [...new Set(res)];
    } catch (err) {
      this.logger.debug(err, "Find All Who Play Error");
    }
  }

  async blockUsersWithdraw(users: string[]) {
    try {
      if (!transaction) {
        transaction = true;
        let txObject: any;
        let gasPrice = await this.web3.eth.getGasPrice();
        txObject = {
          from: process.env.ADMIN_ADDRESS,
          to: process.env.LIVE_WALLET_ADDRESS,
          gasPrice: gasPrice ? gasPrice : this.web3.utils.toWei("20", "Gwei"),
          data: this.live_wallet.methods.updateBetLock(users).encodeABI(),
        };

        let txValidated = false;
        try {
          let estimatedGas = await this.web3.eth.estimateGas(txObject);
          if (estimatedGas) {
            txObject.gasLimit = Math.ceil(estimatedGas * 1.5);
            txValidated = true;
          }
        } catch (error) {
          console.log("estimatedGas error: ", error);
          transaction = false;
          setTimeout(async () => {
            await this.blockUsersWithdraw(users);
          }, 8000);
        }

        if (!txValidated) {
          return;
        }

        const signedTxObject = await this.web3.eth.accounts.signTransaction(
          txObject,
          process.env.SECRET_ACCOUNT
        );
        let tx;
        try {
          tx = await this.web3.eth.sendSignedTransaction(
            signedTxObject.raw || signedTxObject.rawTransaction
          );
          this.logger.log("SUCCESS. USERS LOCK ON BLOCKCHAIN!");
          transaction = false;
          return tx;
        } catch (error) {
          transaction = false;
          this.logger.error("ERROR LOCK USERS ON BLOCKCHAIN!", error.message);
          setTimeout(async () => {
            await this.blockUsersWithdraw(users);
          }, 8000);
          return false;
        }
      } else {
        setTimeout(async () => {
          await this.blockUsersWithdraw(users);
        }, 8000);
      }
    } catch (err) {
      transaction = false;
      this.logger.debug(err, "Block Users Withdraw");
    }
  }

  async unblockUsersWithdraw(users: string[]) {
    try {
      if (!transaction) {
        transaction = true;
        let txObject: any;
        let gasPrice = await this.web3.eth.getGasPrice();
        txObject = {
          from: process.env.ADMIN_ADDRESS,
          to: process.env.LIVE_WALLET_ADDRESS,
          gasPrice: gasPrice ? gasPrice : this.web3.utils.toWei("20", "Gwei"),
          data: this.live_wallet.methods.releaseBetLock(users).encodeABI(),
        };

        let txValidated = false;
        try {
          let estimatedGas = await this.web3.eth.estimateGas(txObject);
          if (estimatedGas) {
            txObject.gasLimit = Math.ceil(estimatedGas * 1.5);
            txValidated = true;
          }
        } catch (error) {
          console.log("estimatedGas error: ", error);
          transaction = false;
          setTimeout(async () => {
            await this.unblockUsersWithdraw(users);
          }, 15000);
        }

        if (!txValidated) {
          return;
        }

        const signedTxObject = await this.web3.eth.accounts.signTransaction(
          txObject,
          process.env.SECRET_ACCOUNT
        );
        let tx;
        try {
          tx = await this.web3.eth.sendSignedTransaction(
            signedTxObject.raw || signedTxObject.rawTransaction
          );
          this.logger.log("SUCCESS. USERS UNLOCK ON BLOCKCHAIN!");
          transaction = false;
          return tx;
        } catch (error) {
          transaction = false;
          this.logger.error("ERROR UNLOCK USERS ON BLOCKCHAIN!", error.message);
          setTimeout(async () => {
            await this.unblockUsersWithdraw(users);
          }, 15000);
          return false;
        }
      } else {
        setTimeout(async () => {
          await this.unblockUsersWithdraw(users);
        }, 8000);
      }
    } catch (err) {
      transaction = false;
      this.logger.debug(err, "Unblock Users Withdraw");
    }
  }

  findOne(id: string) {
    return this.gameRollRepository.findOne({
      where: { id },
      include: [
        {
          model: UserSeed,
          attributes: [
            "user_id",
            "client_seed",
            "server_seed_public",
            "is_active",
          ],
        },
      ],
    });
  }

  findOneWithFullSeed(id: string) {
    return this.gameRollRepository.findOne({
      where: { id },
      include: [
        {
          model: UserSeed,
          attributes: [
            "user_id",
            "client_seed",
            "server_seed_private",
            "server_seed_public",
            "is_active",
          ],
        },
      ],
    });
  }

  update(id: string, updateGameRollDto: UpdateGameRollDto) {
    return this.gameRollRepository.update(updateGameRollDto, { where: { id } });
  }

  remove(id: string) {
    return this.gameRollRepository.destroy({ where: { id } });
  }

  async myBetsHistory(query: {
    offset: string;
    user_id: string;
    limit: string;
  }): Promise<IPaginateStats> {
    try {
      const { offset: off, limit: lim } = this.calculatePagination(
        query.limit,
        query.offset
      );
      const data = await this.gameRollRepository.findAndCountAll({
        where: { user_id: query.user_id },
        order: [["createdAt", "DESC"]],
        limit: lim,
        offset: off,
      });
      const pages = Math.ceil(data.count / lim);
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
        data: [...data.rows],
        items: data.count,
      };
    } catch (err) {
      this.logger.debug(err, "User History Error");
    }
  }

  async stats(query: {
    offset: string;
    user_id: string;
    limit: string;
  }): Promise<IPaginateStats> {
    try {
      const { offset: off, limit: lim } = this.calculatePagination(
        query.limit,
        query.offset
      );
      const data = await this.gameRollRepository.findAndCountAll({
        where: { user_id: query.user_id },
        order: [["createdAt", "DESC"]],
        limit: lim,
        offset: off,
      });

      const last_bet_num_elem = data.rows.length
        ? data.rows[data.rows.length - 1].bet_number
        : 0;

      const last_profit = await this.gameRollRepository.sum("profit", {
        where: {
          bet_number: { [Op.lt]: last_bet_num_elem },
          user_id: query.user_id,
        },
      });
      const pages = Math.ceil(data.count / lim);
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
        data: [...data.rows],
        items: data.count,
        last_profit: last_profit,
      };
    } catch (err) {
      this.logger.debug(err, "User Statistics Error");
    }
  }

  async lastBets(query: {
    offset: string;
    limit: string;
  }): Promise<IPaginateStats> {
    try {
      const { offset: off, limit: lim } = this.calculatePagination(
        query.limit,
        query.offset
      );
      const data = await this.gameRollRepository.findAndCountAll({
        order: [["createdAt", "DESC"]],
        include: [
          { model: User, attributes: ["username", "wallet_address", "id"] },
        ],
        limit: lim,
        offset: off,
      });
      const pages = Math.ceil(data.count / lim);
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
        data: [...data.rows],
        items: data.count,
      };
    } catch (err) {
      this.logger.debug(err, "Last Rolls Error");
    }
  }

  async leaderboard(): Promise<ILeaderboards[]> {
    try {
      const result: ILeaderboards[] = [];

      const leaderboard = await this.sequelize.query(`
        SELECT
        user_id,
        username,
        wallet_address,
        ROUND(SUM(profit)::numeric, 2) profit,
        MAX(profit) profit_ath,
        MAX(bet + COALESCE(color_bet, 0) + COALESCE(type_bet, 0)) max_wager,
        ROUND((SUM(bet) + SUM(COALESCE(color_bet, 0)) + SUM(COALESCE(type_bet, 0)))::numeric, 2) wagared,
        ROUND(COUNT(bet), 2) bets
        FROM
        game_rolls game
        LEFT JOIN users ON users.id = game.user_id
        GROUP BY user_id, username, wallet_address
        ORDER BY profit DESC LIMIT 10
        `);

      if (leaderboard[0].length) {
        leaderboard[0].map((user: any, i: number) => {
          user.profit = Number(user.profit);
          user.bets = Number(user.bets);
          user.wagared = Number(user.wagared);

          result.push({
            ...user,
            number: i + 1,
          });
        });
      }
      return result;
    } catch (err) {
      this.logger.debug(err, "Leaderboard Error");
    }
  }

  async statistics(id: string): Promise<IStats> {
    try {
      let netProfit: number;
      let profitHigh: number;
      let profitLow: number;

      let bets = await this.gameRollRepository.count({
        where: { user_id: id },
      });
      let wageredMain = await this.gameRollRepository.sum("bet", {
        where: { user_id: id },
      });
      let wageredColor = await this.gameRollRepository.sum("color_bet", {
        where: { user_id: id },
      });
      let wageredType = await this.gameRollRepository.sum("type_bet", {
        where: { user_id: id },
      });
      let wagered = wageredMain + wageredColor + wageredType;

      if (wagered) {
        netProfit = await this.gameRollRepository.sum("profit", {
          where: { user_id: id },
        });
        profitHigh = await this.gameRollRepository.max("profit", {
          where: { user_id: id },
        });
        profitLow = await this.gameRollRepository.min("profit", {
          where: { user_id: id },
        });
      }
      return {
        bets,
        wagered,
        netProfit,
        profitHigh,
        profitLow,
      };
    } catch (err) {
      this.logger.debug(err, "Statistics Error");
    }
  }

  getNextRollResult(
    betNumber: number,
    serverSeed: string,
    clientSeed: string
  ): IRollResult {
    try {
      let offset = 0;
      let number: number | string = betNumber;
      const seed: string = crypto
        .createHmac("sha512", serverSeed)
        .update(clientSeed + "," + number)
        .digest("hex");

      do {
        number = seed.substr(offset, 5);
        number = GameRollsService.hexdec(number);
        offset = offset + 5;
      } while (number > 999999);

      return {
        hash: seed,
        result: (Number(number) % 10000) / 100,
      };
    } catch (err) {
      this.logger.debug(err, "Next Roll Result Error");
    }
  }

  async getMaxBet(): Promise<number> {
    let bankroll;
    let staging;
    let frozen;
    let max_bet_ptc;
    try {
      bankroll = await this.bankroll.methods.totalBankroll().call();
      staging = await this.staging.methods.totalStaked().call();
      frozen = await this.staging.methods.totalFrozen().call();
      max_bet_ptc = await this.bankrollSettingRepository.findOne({
        where: { key: "max_bet_ptc" },
      });
      bankroll = this.web3.utils.fromWei(bankroll.toString());
      staging = this.web3.utils.fromWei(staging.toString());
      frozen = this.web3.utils.fromWei(frozen.toString());
    } catch (err) {
      this.logger.debug(err.message, "Get Max Bet");
    }

    if (
      !max_bet_ptc ||
      bankroll === undefined ||
      bankroll === null ||
      staging === null ||
      staging === undefined ||
      frozen === null ||
      frozen === undefined
    ) {
      return null;
    }

    const result = (
      ((Number(bankroll) + (Number(staging) - Number(frozen))) / 100) *
      Number(max_bet_ptc.value)
    ).toFixed(4);

    return Number(result);
  }

  private static hexdec(hexString: string) {
    hexString = (hexString + "").replace(/[^a-f0-9]/gi, "");
    if (hexString.length) {
      return parseInt(hexString, 16);
    } else {
      return 0;
    }
  }

  private static calcPercentOfNumber(amount: number, percent: number): number {
    let hundred = Number((100).toFixed(Number(process.env.SCALE)));
    let res = Number((amount / hundred).toFixed(Number(process.env.SCALE) * 2));
    return Number((res * percent).toFixed(Number(process.env.SCALE)));
  }

  async getMaxWin(): Promise<number> {
    let bankroll;
    let staging;
    let frozen;
    try {
      bankroll = await this.bankroll.methods.totalBankroll().call();
      staging = await this.staging.methods.totalStaked().call();
      frozen = await this.staging.methods.totalFrozen().call();
    } catch (err) {
      this.logger.debug(err.message, "Get Max Win");
    }
    const max_win_ptc = await this.bankrollSettingRepository.findOne({
      where: { key: "max_win_ptc" },
    });

    if (
      !max_win_ptc ||
      bankroll === undefined ||
      bankroll === null ||
      staging === null ||
      staging === undefined ||
      frozen === null ||
      frozen === undefined
    ) {
      return null;
    }

    bankroll = this.web3.utils.fromWei(bankroll.toString());
    staging = this.web3.utils.fromWei(staging.toString());
    frozen = this.web3.utils.fromWei(frozen.toString());

    const result = (
      ((Number(bankroll) + (Number(staging) - Number(frozen))) / 100) *
      Number(max_win_ptc.value)
    ).toFixed(4);

    return Number(result);
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

  private async getPlayerEdge(): Promise<number> {
    const houseEdge = await this.gameSettingRepository.findOne({
      where: { key: "house_edge" },
    });
    return (100 - Number(houseEdge.value)) / 100;
  }

  private getMainBetResults(
    selectedRange: string,
    rollResult: number,
    playerEdge: number,
    mainBet: number
  ): IMainBetResults {
    try {
      let isWinner = false;
      let winChance: number;
      let profit: number;
      let selectedRollArray: IMinMax | IMinMax[] = this.parseRangeStrToArray(
        selectedRange
      );
      if (
        selectedRollArray.hasOwnProperty("min") &&
        !Array.isArray(selectedRollArray)
      ) {
        winChance = selectedRollArray.max - selectedRollArray.min + 0.01;
        if (
          rollResult >= selectedRollArray.min &&
          rollResult <= selectedRollArray.max
        ) {
          isWinner = true;
        }
      } else if (Array.isArray(selectedRollArray)) {
        winChance = 0.01;
        selectedRollArray.map((el) => {
          winChance += el.max - el.min;

          if (rollResult >= el.min && rollResult <= el.max) {
            isWinner = true;
          }
        });
      }

      let multiplier = (100 / winChance) * playerEdge;

      if (isWinner) {
        profit = +(mainBet * multiplier - mainBet).toFixed(4);
      } else {
        profit = -mainBet;
      }

      return { profit, multiplier };
    } catch (err) {
      this.logger.debug(err, "Main Bet Result Error");
    }
  }

  private parseRangeStrToArray(rangeStr: string): IMinMax | IMinMax[] {
    let range: IMinMax | IMinMax[];
    if (rangeStr.indexOf("|") !== -1) {
      let ranges = rangeStr.split("|");
      if (ranges.length === 2) {
        const range1: any = this.parseRangeStrToArray(ranges[0]);
        const range2: any = this.parseRangeStrToArray(ranges[1]);
        range = [range1, range2];
      } else {
        throw new Error("Wrong range selected");
      }
    } else {
      if (rangeStr.indexOf("-") === -1) {
        throw new Error("Wrong range selected");
      }

      let rangeSplit = rangeStr.split("-");
      let min = parseFloat(rangeSplit[0]);
      let max = parseFloat(rangeSplit[1]);
      if (min <= max && max - min <= 98) {
        range = { min, max };
      } else {
        throw new Error("Wrong range selected");
      }
    }

    return range;
  }

  private async getColorBetResults(
    selectedColor: number,
    colorResult: number,
    colorBet: number
  ) {
    try {
      let houseEdge = await this.gameSettingRepository.findOne({
        where: { key: "side_bet_chance" },
      });
      let profit: string;
      let winChance = 10;
      let playerEdge = (100 - Number(houseEdge.value)) / 100;
      let multiplier = (100 / winChance) * playerEdge;

      if (selectedColor < 0 || selectedColor > 9) {
        throw new ValidationException("Wrong color selected");
      }

      if (selectedColor === colorResult) {
        profit = (colorBet * multiplier - colorBet).toFixed(2);
      } else {
        profit = (-colorBet).toString();
      }
      return Number(profit);
    } catch (err) {
      this.logger.debug(err, "Color Bet Result Error");
    }
  }

  private async getTypeBetResults(
    selectedType: number,
    typeResult: number,
    typeBet: number
  ) {
    try {
      let houseEdge = await this.gameSettingRepository.findOne({
        where: { key: "side_bet_chance" },
      });
      let profit: string;
      let winChance = 5;
      let playerEdge = (100 - Number(houseEdge.value)) / 100;
      let multiplier = (100 / winChance) * playerEdge;

      if (selectedType < 0 || selectedType > 20) {
        throw new ValidationException("Wrong type range selected");
      }

      if (selectedType === typeResult) {
        profit = (typeBet * multiplier - typeBet).toFixed(2);
      } else {
        profit = (-typeBet).toString();
      }

      return Number(profit);
    } catch (err) {
      this.logger.debug(err, "Ivader Result Error");
    }
  }

  private async getHousePtc(): Promise<number> {
    const res = await this.bankrollSettingRepository.findOne({
      where: { key: "house_ptc" },
    });
    return Number(res.value);
  }

  private async getInvestorsPtc(): Promise<number> {
    const res = await this.bankrollSettingRepository.findOne({
      where: { key: "investors_ptc" },
    });
    return Number(res.value);
  }

  private async calcHouseAndInvestorsPart(
    user: User,
    profit: number,
    housePartPtc: number,
    isWinner: boolean
  ) {
    try {
      const getProfit = profit > 0 ? profit : Math.abs(profit);

      let potentialProfit = await this.userService.getPotentialProfit(
        user.id,
        user.balance
      );

      let userFundsDecimal = potentialProfit.userFunds;
      let bonusFundsDecimal = potentialProfit.bonusFunds;

      if (isWinner) {
        let housePart = null;
        let investorsPart = getProfit;
        let newBonusFundsDecimal = bonusFundsDecimal + getProfit;

        return {
          housePart,
          investorsPart,
          userFundsDecimal,
          newBonusFundsDecimal,
        };
      } else {
        //     // lose
        if (userFundsDecimal === 0) {
          let housePart = null;
          let investorsPart = getProfit * -1;
          let newBonusFundsDecimal = bonusFundsDecimal - getProfit;
          return {
            housePart,
            investorsPart,
            userFundsDecimal,
            newBonusFundsDecimal,
          };
        } else {
          if (getProfit > bonusFundsDecimal) {
            let investorsPart = bonusFundsDecimal;
            let fundsLeft =
              getProfit -
              (bonusFundsDecimal > 0
                ? bonusFundsDecimal
                : bonusFundsDecimal * -1);

            if (fundsLeft > userFundsDecimal) {
              throw new HttpException("Invalid user funds", 500);
            }

            let housePart = GameRollsService.calcPercentOfNumber(
              fundsLeft,
              housePartPtc
            );
            investorsPart = investorsPart + (fundsLeft - housePart);

            //             // check
            if (!(getProfit === housePart + investorsPart)) {
              throw new HttpException("Invalid percents", 500);
            }

            housePart = Math.abs(housePart);
            investorsPart = Math.abs(investorsPart);

            let newUserFundsDecimal = userFundsDecimal - fundsLeft;
            let newBonusFundsDecimal = 0.0;

            return {
              housePart,
              investorsPart,
              newUserFundsDecimal,
              newBonusFundsDecimal,
            };
          } else {
            let housePart = null;
            let investorsPart = getProfit * -1;
            let newBonusFundsDecimal = bonusFundsDecimal - getProfit;

            return {
              housePart,
              investorsPart,
              userFundsDecimal,
              newBonusFundsDecimal,
            };
          }
        }
      }
    } catch (err) {
      this.logger.debug(err, "Calc House And Investors Part Error");
    }
  }

  public async getLastPotentialProfit(userId: string) {
    return this.gameRollRepository.findOne({
      attributes: ["id", "user_id", "potential_profit", "created_at"],
      where: { user_id: userId },
      order: [["id", "DESC"]],
    });
  }

  private async saveOnBlockchain(
    values: number[],
    address: string[],
    method: boolean
  ) {
    //if (!transaction) {
    try {
      //transaction = true;
      let txObject: any;
      const gasPrice = await this.web3.eth.getGasPrice();
      if (method) {
        txObject = {
          from: process.env.ADMIN_ADDRESS,
          to: process.env.LIVE_WALLET_ADDRESS,
          gasPrice: gasPrice ? gasPrice : this.web3.utils.toWei("20", "Gwei"),
          data: this.live_wallet.methods
            .registerWin(values, address)
            .encodeABI(),
        };
      } else {
        txObject = {
          from: process.env.ADMIN_ADDRESS,
          to: process.env.LIVE_WALLET_ADDRESS,
          gasPrice: gasPrice ? gasPrice : this.web3.utils.toWei("20", "Gwei"),
          data: this.live_wallet.methods
            .registerLoss(values, address)
            .encodeABI(),
        };
      }
      let txValidated = false;
      let estimatedGas = await this.web3.eth.estimateGas(txObject);
      if (estimatedGas) {
        txObject.gasLimit = Math.ceil(estimatedGas * 2);
        txValidated = true;
      }

      if (!txValidated) {
        return false;
      }

      const signedTxObject = await this.web3.eth.accounts.signTransaction(
        txObject,
        process.env.SECRET_ACCOUNT
      );
      


      let tx;
      let tran = await this.web3.eth.sendSignedTransaction(
        signedTxObject?.raw || signedTxObject?.rawTransaction
      );

      //------
      /* tran.on('transactionHash', hash => {
        tx = hash;

      });

      tran.on('receipt', async receipt => {
        
        this.logger.log("SUCCESS. GAMES SAVED ON BLOCKCHAIN!");
        
        return true;
      });

      tran.on('error', async (error) => {
        this.logger.error(error);
        throw new Error("Transaction failed");

      }); */
      //------


      //this.logger.log("SUCCESS. GAMES SAVED ON BLOCKCHAIN!");
      //transaction = false;

      return true;
    } catch (error) {
      //transaction = false;
      this.logger.error("ERROR GAMES SAVED ON BLOCKCHAIN!", error.message);
      this.logger.error(method ? "registerWin" : "registerLoss");
      this.logger.error(values, "ERROR GAMES SAVED ON BLOCKCHAIN Values!");
      this.logger.error(address, "ERROR GAMES SAVED ON BLOCKCHAIN Address!");

      return false;
    }

  }

  async sendDataToBlockchain() {
    try {
      redis.get("transaction_lock", async (lock) => {
        console.log("lock status in callback is:" + lock);
        if (!lock) {
          lock = "false";
        }
        if (lock == "false") {
          console.log("inside the if condition");
          setTransactionLock("true");
          let win_address = [];
          let win_profit = [];
          let loss_address = [];
          let loss_profit = [];
          let data: {
            id: number;
            profit: number;
            wallet: string;
          }[] = await this.tempProfitRepository.findAll();

          console.log(data.length);
          data.map((el) => {
            if (el.profit > 0) {
              //const profitWEI = this.web3.utils.toWei(el.profit.toString());
              win_address.push(el.wallet);
              win_profit.push(new BigNumber(el.profit).toFixed());
            } else if (el.profit < 0) {
              /* const profitWEI = this.web3.utils.toWei(
                Math.abs(Number(el.profit)).toString()
              ); */
              loss_address.push(el.wallet);
              loss_profit.push(new BigNumber(Math.abs(Number(el.profit))).toFixed());
            }
          });

          const chunk = (array, chunkSize) => {
            return (
              Array(Math.ceil(array.length / chunkSize))
                // @ts-ignore
                .fill()
                .map(function (_, i) {
                  return array.slice(i * chunkSize, i * chunkSize + chunkSize);
                })
            );
          };

          if (win_address.length) {
            // @ts-ignore
            win_address = chunk(win_address, 100);
            // @ts-ignore
            win_profit = chunk(win_profit, 100);
          }

          if (loss_address.length) {
            // @ts-ignore
            loss_address = chunk(loss_address, 3);
            // @ts-ignore
            loss_profit = chunk(loss_profit, 3);
          }

          if (win_address.length) {
            console.log(win_address, "Try Save On Blockchain Wins Addresses");
            for await (const index of win_address.keys()) {
              let success: any = await this.saveOnBlockchain(
                win_profit[index],
                win_address[index],
                true
              );
              if (success == false) {
                let count = 0;
                while (success == false) {
                  await new Promise(function (resolve, reject) { return setTimeout(resolve, 5000) })
                  success = await this.saveOnBlockchain(
                    win_profit[index],
                    win_address[index],
                    true
                  );
                  console.log("inside retry loop, success is:" + success);
                  count++;
                  if (count >= 3) {
                    break;
                  }
                }
              }
              if (success) {
                let i = 0;
                for (i = 0; i < win_address[index].length; i++) {

                  await this.tempProfitRepository.increment(
                    {
                      profit: (win_profit[index][i].toString() * -1)
                    },
                    {
                      where: { wallet: win_address[index][i] },
                    }
                  );
                }
              }
            }
          }

          if (loss_address.length) {
            console.log(loss_address, "Try Save On Blockchain Loss Addresses");
            for await (const index of loss_address.keys()) {
              let success: any = await this.saveOnBlockchain(
                loss_profit[index],
                loss_address[index],
                false
              );
              if (success == false) {
                let count = 0;
                while (success == false) {

                  await new Promise(function (resolve, reject) { return setTimeout(resolve, 5000) })
                  success = await this.saveOnBlockchain(
                    loss_profit[index],
                    loss_address[index],
                    false
                  );
                  console.log("inside retry loop, success is:" + success);
                  count++;
                  if (count >= 3) {
                    break;
                  }
                }
              }
              console.log("success is" + success);
              if (success) {
                let i = 0;
                for (i = 0; i < loss_address[index].length; i++) {
                  //console.log(this.web3.utils.fromWei(loss_profit[index][i].toString()),loss_address[index][i])
                  await this.tempProfitRepository.increment({
                    profit: loss_profit[index][i].toString()
                  },
                    {
                      where: { wallet: loss_address[index][i] },
                    });
                }
              }
            }
          }
          setTransactionLock("false");
        }
      })
    } catch (err) {
      this.logger.debug(err, "Error Send Data To Blockchain");
      setTransactionLock("false");
    }
  }
}

async function getTrasactionLock() {
  try {
    let promise = util.promisify(redis.get).bind(redis);
    let lock = await promise("transaction_lock");
    redis.get("transaction_lock", (lock) => {
      console.log("lock status in callback is:" + lock);
    })
    if (lock) {
      console.log("lock status from redis: " + lock);
      return lock;
    } else {
      console.log("fetching lock status from redis failed");
      return false;
    }
  } catch (error) {
    return false;
  }

}
function setTransactionLock(lockStatus: string) {
  redis.set("transaction_lock", lockStatus);
}
