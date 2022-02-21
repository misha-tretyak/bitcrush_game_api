import {
  BadRequestException,
  CACHE_MANAGER,
  HttpException,
  HttpStatus,
  Inject,
  Injectable,
  Logger,
} from "@nestjs/common";
import { User } from "./users.model";
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserDto } from "./dto/create-user.dto";
import { RolesService } from "../roles/roles.service";
import { AddRoleDto } from "./dto/add-role.dto";
import { UserDepositsService } from "../user-deposits/user-deposits.service";
import { UserWithdrawsService } from "../user-withdraws/user-withdraws.service";
import { UserBonusesService } from "../user-bonuses/user-bonuses.service";
import { BankrollInvestorsService } from "../bankroll-investors/bankroll-investors.service";
import { BancrollInvestorHistoryService } from "../bancroll-investor-history/bancroll-investor-history.service";
import { BancrollInvestorHistory } from "../bancroll-investor-history/bancroll-investor-history.model";
import { BankrollHouseCategoryService } from "../bankroll-house-category/bankroll-house-category.service";
import { BankrollHouseHistoryService } from "../bankroll-house-history/bankroll-house-history.service";
import { GameRollsService } from "src/game-rolls/game-rolls.service";
import { Cache } from "cache-manager";
import { UserWithdraw } from "src/user-withdraws/user-withdraws.model";
import { UserBonus } from "src/user-bonuses/user-bonuses.model";
import sequelize, { FindOptions, Op } from "sequelize";
import { BankrollHouseHistory } from "../bankroll-house-history/bankroll-house-history.model";
import { UserDeposit } from "../user-deposits/user-deposits.model";
import { ProbablyFairService } from "../probably-fair/probably-fair.service";
import { Role } from "../roles/roles.model";
const Web3 = require("web3");
import * as Config from "../config";
import { AuthService } from "../auth/auth.service";
import { GameSettingsService } from "../game-settings/game-settings.service";
import { TempProfit } from "../temp-profit/temp-profit.model";
import { BigNumber } from "bignumber.js";
import Redis from "ioredis";
const STATUS_ACCEPTED = 1;
const STATUS_FINISHED = 2;
const SCALE = 8;
const TYPE_WITHDRAWAL = 1;
const BALANCE_CHANGE_TYPE = "balance_change";
const INVESTOR_TYPE_WITHDRAWAL = 2;

interface IHistory {
  amount: number;
  timestamp: Date;
  type: string;
}

interface IPotentialProfit {
  userFunds?: number;
  bonusFunds?: number;
  userFundsLast?: number;
  userFundsCached?: number;
  bonusFundsCached?: number;
  bonusFundsLast?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User) public readonly userRepository: typeof User,
    @InjectModel(UserBonus)
    private readonly userBonusRepository: typeof UserBonus,
    @InjectModel(UserDeposit)
    private readonly userDepositRepository: typeof UserDeposit,
    @InjectModel(UserWithdraw)
    private readonly userWithdrawRepository: typeof UserWithdraw,
    @InjectModel(BancrollInvestorHistory)
    private readonly bancrollInvestorHistoryRepository: typeof BancrollInvestorHistory,
    @InjectModel(BankrollHouseHistory)
    private readonly bankrollHouseHistoryRepository: typeof BankrollHouseHistory,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    private readonly roleService: RolesService,
    private readonly userDepositsService: UserDepositsService,
    private readonly userWithdrawalsServise: UserWithdrawsService,
    private readonly userBonusesServise: UserBonusesService,
    private readonly investorServise: BankrollInvestorsService,
    private readonly investorHistoryServise: BancrollInvestorHistoryService,
    private readonly bankrollHouseCategoryServise: BankrollHouseCategoryService,
    private readonly bankrollHouseHistoryServise: BankrollHouseHistoryService,
    private readonly gameRollServise: GameRollsService,
    private readonly gameSettingsService: GameSettingsService,
    private readonly probablyFairService: ProbablyFairService,
    private readonly authService: AuthService,
    @InjectModel(TempProfit)
    private readonly tempProfitRepository: typeof TempProfit
  ) { }

  private logger: Logger = new Logger("UsersService");
  provider = new Web3.providers.HttpProvider(process.env.NODE_URL);
  web3 = new Web3(this.provider);
  live_wallet = new this.web3.eth.Contract(
    Config.config.live_wallet.abi,
    Config.config.live_wallet.address
  );
  redis = new Redis();
  async createUser(dto: CreateUserDto) {
    try {
      const role = await this.roleService.getRoleByValue("USER");
      if (role) {
        const user = await this.userRepository.create(dto);
        await user.$set("roles", [role.id]);
        user.roles = [role];
        await user.save();
        await this.probablyFairService.generateNewSeeds(user.id);
        return user;
      }
      throw new HttpException("Role not found", HttpStatus.NOT_FOUND);
    } catch (err) {
      this.logger.debug(err, "Create User Error");
    }
  }

  async getAllUsers() {
    return await this.userRepository.findAll({ include: { all: true } });
  }

  async getUserByWalletAddressForClient(wallet_address: string) {
    try {
      const time = await this.gameSettingsService.findOneByKey(
        "block_users_time"
      );
      const users = await this.gameRollServise.findAllWhoPlay(
        +time.value * 1000
      );

      const user = await this.userRepository.findOne({
        where: { wallet_address: wallet_address },
      });

      if (users.indexOf(wallet_address) === -1) {
        wallet_address = wallet_address.toLowerCase();

        let user_balance: any = await this.live_wallet.methods
          .balanceOf(wallet_address)
          .call();



        let temp_user_profit = await this.tempProfitRepository.sum("profit", {
          where: { wallet: wallet_address },
        });
        console.log(temp_user_profit);

        user_balance = new BigNumber(user_balance);
        if (temp_user_profit) {
          if (temp_user_profit > 0) {
            user_balance = user_balance.plus(temp_user_profit);
          } else {
            user_balance = user_balance.minus(Math.abs(temp_user_profit));
          }
        }
        user_balance = user_balance.div(10 ** 18);
        if (user) {
          if (user_balance.toNumber() !== Number(user?.balance)) {
            await this.userRepository.update(
              { balance: user_balance.toNumber() },
              { where: { wallet_address: wallet_address } }
            );
          }
        } else {
          try {
            await this.authService.registration({ wallet_address: wallet_address });
          } catch (error) {

          }

        }
        let updatedUser = await this.userRepository.findOne({
          where: { wallet_address: wallet_address },
          attributes: ["wallet_address", "nonce", "id", "balance"],
        });

        updatedUser.balance = Number(user_balance.toFixed());
        /* let redisBalance : any = null;
        try {
          redisBalance = await this.redis.get(wallet_address.toLowerCase());
          if(redisBalance == null){
            await this.redis.set(wallet_address.toLowerCase(),user_balance.toNumber());
          }
        } catch (error) {
          console.log(error);
        } */
        return updatedUser;
      } else {
        let updatedUser = await this.userRepository.findOne({
          where: { wallet_address: wallet_address },
          attributes: ["wallet_address", "nonce", "id", "balance"],
        });
        if (!updatedUser) {
          try {
            await this.authService.registration({ wallet_address: wallet_address });
            updatedUser = await this.userRepository.findOne({
              where: { wallet_address: wallet_address },
              attributes: ["wallet_address", "nonce", "id", "balance"],
            });
          } catch (error) {
          }
        }
        let user_balance: any;
        
        
        
          
          user_balance = await this.live_wallet.methods
            .balanceOf(wallet_address)
            .call();
          let temp_user_profit = await this.tempProfitRepository.sum("profit", {
            where: { wallet: wallet_address },
          });
          console.log(temp_user_profit);
          user_balance = new BigNumber(user_balance);
          if (temp_user_profit) {
            if (temp_user_profit > 0) {
              user_balance = user_balance.plus(temp_user_profit);
            } else {
              user_balance = user_balance.minus(Math.abs(temp_user_profit));
            }
          }
          user_balance = user_balance.div(10 ** 18);
          updatedUser.balance = user_balance.toNumber();
          //await this.redis.set(wallet_address.toLowerCase(),user_balance.toNumber());
        

        return updatedUser;

      }
      /* return await this.userRepository.findOne({
        where: { wallet_address: wallet_address },
        attributes: ["wallet_address", "nonce", "id", "balance"],
      }); */
    } catch (err) {
      this.logger.error(err, "Get User By Wallet Error");
    }
  }


  async getUserByWalletAddress(wallet_address: string) {
    try {
      const time = await this.gameSettingsService.findOneByKey(
        "block_users_time"
      );
      const users = await this.gameRollServise.findAllWhoPlay(
        +time.value * 1000
      );

      const user = await this.userRepository.findOne({
        where: { wallet_address: wallet_address },
      });

      if (users.indexOf(wallet_address) === -1) {
        wallet_address = wallet_address.toLowerCase();

        let user_balance: number = await this.live_wallet.methods
          .balanceOf(wallet_address)
          .call();

        user_balance = this.web3.utils.fromWei(user_balance.toString());

        let temp_user_profit = await this.tempProfitRepository.sum("profit", {
          where: { wallet: wallet_address },
        });
        console.log(temp_user_profit);

        if (temp_user_profit) {
          if (temp_user_profit > 0) {
            user_balance = Number(user_balance) + Number(this.web3.utils.fromWei(temp_user_profit.toString()));
          }


        }
        if (user) {
          if (Number(user_balance) !== Number(user?.balance)) {
            await this.userRepository.update(
              { balance: +user_balance },
              { where: { wallet_address: wallet_address } }
            );
          }
        }

      }
      return await this.userRepository.findOne({
        where: { wallet_address: wallet_address },
        attributes: ["wallet_address", "nonce", "id", "balance"],
      });
    } catch (err) {
      this.logger.error(err, "Get User By Wallet Error");
    }
  }

  async getUserBalanceByWalletInDB(wallet_address: string) {
    try {
      wallet_address = wallet_address.toLowerCase();
      let user = await this.userRepository
        .findOne({
          where: { wallet_address },
          attributes: ["balance", "id"],
        })
        .catch((error) => {
          console.log(error);
        });
      if (user) {
        const time = await this.gameSettingsService.findOneByKey(
          "block_users_time"
        );
        const users = await this.gameRollServise.findAllWhoPlay(
          +time.value * 1000
        );
        if (users.indexOf(wallet_address) === -1) {
          wallet_address = wallet_address.toLowerCase();
          let user_balance: number = await this.live_wallet.methods
            .balanceOf(wallet_address)
            .call();
          user_balance = this.web3.utils.fromWei(user_balance.toString());
          user.balance = +user_balance;
          await user.save();
        }
        return { user_balance: +user.balance };
      } else {
        await this.authService.registration({ wallet_address: wallet_address });
        user = await this.userRepository.findOne({
          where: { wallet_address },
          attributes: ["balance", "id"],
        });
      }
      return { user_balance: +user.balance };
    } catch (err) {
      this.logger.error(err, "Get User Balance By Wallet Error");
    }
  }

  async getUserBalanceByWalletInLW(wallet_address: string) {
    try {
      wallet_address = wallet_address.toLowerCase();
      let user_balance: number = await this.live_wallet.methods
        .balanceOf(wallet_address)
        .call();
      user_balance = this.web3.utils.fromWei(user_balance.toString());
      return { user_balance: +user_balance };
    } catch (err) {
      this.logger.error(err, "Get User Balance By Wallet In LW Error");
    }
  }

  async getUserInfoByWalletAddress(wallet_address: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { wallet_address },
        attributes: ["username", "email", "enabled_2fa"],
      });
      if (user) {
        return user;
      } else {
      }
    } catch (err) {
      this.logger.error(err, "Get User Info By Wallet Error");
    }
  }

  async getUserByEmail(email: string) {
    return await this.userRepository.findOne({
      where: { email },
      include: { model: Role },
    });
  }

  getUserById(id: string) {
    return this.userRepository.findOne({ where: { id } });
  }

  async getUserByUsername(username: string) {
    const user = await this.userRepository.findOne({ where: { username } });
    return user;
  }

  async activate(email_verify_link: string) {
    try {
      const user = await this.userRepository.findOne({
        where: { email_verify_link },
      });
      if (!user) {
        throw new BadRequestException("Incorrect activation link");
      }
      user.email_verified_at = new Date(Date.now());
      await user.save();
    } catch (err) {
      this.logger.error(err, "Activate User By Link");
    }
  }

  async getUserByToken(remember_token: string) {
    return await this.userRepository.findOne({
      where: { remember_token: remember_token },
      include: { model: Role },
    });
  }

  async addRole(dto: AddRoleDto) {
    try {
      const role = await this.roleService.getRoleByValue(dto.value);
      const user = await this.userRepository.findByPk(dto.userId);
      if (role && user) {
        await user.$add("role", role.id);
        return dto;
      }
      throw new HttpException("User or role not found", HttpStatus.NOT_FOUND);
    } catch (err) {
      this.logger.error(err, "Add Roll Error");
    }
  }

  async updateBalance(dto: { wallet_address: string; balance: number }) {
    return await this.userRepository
      .findOne({ where: { wallet_address: dto.wallet_address } })
      .then((res) => {
        res.balance = dto.balance;
        res.save();
        return res;
      })
      .catch((error) => {
        throw new HttpException("User not found", HttpStatus.NOT_FOUND);
      });
  }

  public async getPotentialProfit(
    userId: string,
    wallet: number
  ): Promise<IPotentialProfit> {
    try {
      let cachedPotentialProfit = await this.getPotentialProfitFromCache(
        userId
      );
      let lastCachedRollTimestamp = await this.getRollTimeFromCache(userId);

      if (cachedPotentialProfit[0] !== null && !lastCachedRollTimestamp) {
        //     // last potential profit exists in the cache
        let userFundsCached = +cachedPotentialProfit[0] ?? 0.0;
        let bonusFundsCached = +cachedPotentialProfit[1] ?? 0.0;

        //     // check relevance
        let isRelevance = this.checkPotentialProfitRelevance(
          userId,
          lastCachedRollTimestamp
        );

        if (isRelevance) {
          //         // get potential profit from cache

          //         // validation
          this.isPotentialProfitValid(
            userFundsCached,
            bonusFundsCached,
            wallet
          );

          return { userFundsCached, bonusFundsCached };
        } else {
          //         // get new potential profit
          let newPotentialProfit = await this.calcPotentialProfit(
            userId,
            lastCachedRollTimestamp,
            userFundsCached,
            bonusFundsCached
          );

          let userFunds = newPotentialProfit.userFunds;
          let bonusFunds = newPotentialProfit.bonusFunds;
          let timestamp = newPotentialProfit.timestamp;
          // validation
          this.isPotentialProfitValid(userFunds, bonusFunds, wallet);

          return { userFunds, bonusFunds };
        }
      } else {
        let lasUserPotentialProfit = await this.getLastPotentialProfitFromRolls(
          userId
        );

        if (
          lasUserPotentialProfit.userFunds !== null &&
          !lasUserPotentialProfit.timestamp
        ) {
          //         // check relevance
          let lastRollTimestamp = lasUserPotentialProfit.timestamp;
          let isLastRelevance = this.checkPotentialProfitRelevance(
            userId,
            lastRollTimestamp
          );
          let userFundsLast = lasUserPotentialProfit.userFunds ?? 0.0;
          let bonusFundsLast = lasUserPotentialProfit.bonusFunds ?? 0.0;

          if (isLastRelevance) {
            //             // get potential profit from cache

            //             // validation
            this.isPotentialProfitValid(userFundsLast, bonusFundsLast, wallet);

            return { userFundsLast, bonusFundsLast };
          } else {
            //             // get new potential profit
            let newPotentialProfit = await this.calcPotentialProfit(
              userId,
              lastRollTimestamp,
              userFundsLast,
              bonusFundsLast
            );

            let userFunds = newPotentialProfit.userFunds;
            let bonusFunds = newPotentialProfit.bonusFunds;
            let timestamp = newPotentialProfit.timestamp;

            //             // validation
            this.isPotentialProfitValid(userFunds, bonusFunds, wallet);

            return { userFunds, bonusFunds };
          }
        } else {
          //         // calc

          let newPotentialProfit = await this.calcPotentialProfit(userId);

          let userFunds = newPotentialProfit.userFunds;
          let bonusFunds = newPotentialProfit.bonusFunds;
          let timestamp = newPotentialProfit.timestamp;

          //         // validation
          // this.isPotentialProfitValid(userFunds, bonusFunds, wallet);

          return { userFunds, bonusFunds };
        }
      }
    } catch (err) {
      this.logger.error(err, "Get Potential Profit Error");
    }
  }

  private isPotentialProfitValid(
    userFunds: number,
    bonusFunds: number,
    wallet: number
  ) {
    try {
      const sumBalance = userFunds + bonusFunds;

      if (wallet !== sumBalance) {
        throw new HttpException(
          "Deposit is not yet confirmed. It can take anywhere from 2-4 confirmations before deposit is confirmed on the blockchain. Please check transaction hash to determine remaining time",
          500
        );
      }
      return true;
    } catch (err) {
      this.logger.error(err, "Is Potential Profit Valid Error");
    }
  }

  private async calcPotentialProfit(
    userId: string,
    timestamp = null,
    userFunds = null,
    bonusFunds = null
  ) {
    try {
      const history: IHistory[] = [];
      const typeIncoming = "incoming";
      const typeBonusIncoming = "bonus_incoming";
      const typeOutgoing = "outgoing";
      let lastTimestamp = null;

      let depositsBuild: FindOptions<UserDeposit> = {
        attributes: ["cc_amount", "updatedAt"],
        where: {
          user_id: userId,
          status: { [Op.in]: [STATUS_ACCEPTED, STATUS_FINISHED] },
          updatedAt: {},
        },
        order: [["updatedAt", "ASC"]],
      };

      let withdrawalsBuild: FindOptions<UserWithdraw> = {
        attributes: ["cc_amount", "createdAt"],
        where: {
          user_id: userId,
          status: { [Op.in]: [STATUS_ACCEPTED, STATUS_FINISHED] },
          // createdAt: {}
        },
        order: [["updatedAt", "ASC"]],
      };

      let bonusesAndCreditsBuild: FindOptions<UserBonus> = {
        attributes: ["amount", "type", "createdAt"],
        where: { user_id: userId, createdAt: {} },
        order: [["createdAt", "ASC"]],
      };

      let bankrollHistoryBuild = null;
      let houseWithdrawalsBuild = null;
      let bankrollHistory = null;
      let houseWithdrawals = null;

      const investor = await this.investorServise.findByUserId(userId);

      if (investor) {
        bankrollHistoryBuild = {
          attributes: [
            "type",
            "created_at",
            [
              sequelize.fn(
                "SUM",
                (sequelize.fn(
                  "ROUND",
                  sequelize.fn("COALESCE", sequelize.col("amount"), 0),
                  SCALE
                ),
                  sequelize.literal("+"),
                  sequelize.fn(
                    "ROUND",
                    sequelize.fn("COALESCE", sequelize.col("dilution_fee"), 0),
                    SCALE
                  ))
              ),
              "amount",
            ],
          ],
          where: { investor_id: investor.id, createdAt: {} },
          order: [["createdAt", "ASC"]],
        };
      }

      const house = await this.bankrollHouseCategoryServise.findByUserId(
        userId
      );

      if (house) {
        houseWithdrawalsBuild = {
          attributes: ["amount", "createdAt"],
          where: { type: TYPE_WITHDRAWAL, category_id: house.id },
          order: [["created_at", "ASC"]],
        };
      }

      let getUserFunds = userFunds ?? 0.0;
      let getBonusFunds = bonusFunds ?? 0.0;

      if (timestamp) {
        const dateFrom = new Date(timestamp);
        //     $bonusFunds = floatval($bonusFunds);

        depositsBuild.where = { updatedAt: { gt: dateFrom } };

        withdrawalsBuild.where = { createdAt: { gt: dateFrom } };
        bonusesAndCreditsBuild.where = { createdAt: { gt: dateFrom } };

        if (bankrollHistoryBuild) {
          bankrollHistoryBuild = {
            attributes: [
              "type",
              "createdAt",
              [
                sequelize.fn(
                  "SUM",
                  (sequelize.fn(
                    "ROUND",
                    sequelize.fn("COALESCE", sequelize.col("amount"), 0),
                    SCALE
                  ),
                    sequelize.literal("+"),
                    sequelize.fn(
                      "ROUND",
                      sequelize.fn("COALESCE", sequelize.col("dilution_fee"), 0),
                      SCALE
                    ))
                ),
                "amount",
              ],
            ],
            where: { investor_id: investor.id, createdAt: { gt: dateFrom } },
            order: [["createdAt", "ASC"]],
          };
        }

        if (houseWithdrawalsBuild) {
          houseWithdrawalsBuild = {
            attributes: ["amount", "createdAt"],
            where: {
              type: TYPE_WITHDRAWAL,
              category_id: house.id,
              createdAt: { gt: dateFrom },
            },
            order: [["createdAt", "ASC"]],
          };
        }
      } else {
        getUserFunds = 0.0;
        getBonusFunds = 0.0;
      }

      // /** @var Collection|UserDeposit[] $deposits */
      const deposits = await this.userDepositRepository.findAll(
        bankrollHistoryBuild
      );
      if (deposits && deposits.length > 0) {
        deposits.map((deposit) => {
          let itemTimestamp = deposit.updatedAt;

          history.push({
            amount: deposit.cc_amount,
            type: typeIncoming,
            timestamp: itemTimestamp,
          });
        });
      }

      // /** @var Collection|UserWithdraw[] $withdrawals */
      const withdrawals = await this.userWithdrawRepository.findAll(
        withdrawalsBuild
      );

      if (withdrawals && withdrawals.length > 0) {
        withdrawals.map((withdrawal) => {
          let itemTimestamp = withdrawal.createdAt;

          history.push({
            amount: withdrawal.cc_amount,
            type: typeOutgoing,
            timestamp: itemTimestamp,
          });
        });
      }

      // /** @var Collection|UserBonus[] $bonusesAndCredits */
      const bonusesAndCredits = await this.userBonusRepository.findAll(
        bonusesAndCreditsBuild
      );

      if (bonusesAndCredits && bonusesAndCredits.length > 0) {
        bonusesAndCredits.map((userBonus) => {
          let itemTimestamp = userBonus.createdAt;
          let itemType = "";

          if (Number(userBonus.amount) < 0) {
            itemType = typeOutgoing;
          } else {
            itemType =
              userBonus.type === BALANCE_CHANGE_TYPE
                ? typeIncoming
                : typeBonusIncoming;
          }

          history.push({
            amount: Number(userBonus.amount),
            type: itemType,
            timestamp: itemTimestamp,
          });
        });
      }

      if (bankrollHistoryBuild) {
        //     /** @var Collection|BankrollInvestorHistory[] $bankrollHistory */
        const bankrollHistory = await this.bancrollInvestorHistoryRepository.findAll(
          bankrollHistoryBuild
        );

        if (bankrollHistory && bankrollHistory.length > 0) {
          bankrollHistory.map((historyItem) => {
            let itemTimestamp = historyItem.createdAt;
            let itemType =
              historyItem.type === INVESTOR_TYPE_WITHDRAWAL
                ? typeIncoming
                : typeOutgoing;

            history.push({
              amount: historyItem.amount,
              type: itemType,
              timestamp: itemTimestamp,
            });
          });
        }
      }

      if (houseWithdrawalsBuild) {
        //     /** @var Collection|BankrollHouseHistory[] $houseWithdrawals */
        const houseWithdrawals = await this.bankrollHouseHistoryRepository.findAll(
          houseWithdrawalsBuild
        );

        if (houseWithdrawals && houseWithdrawals.length > 0) {
          houseWithdrawals.map((withdrawal) => {
            let itemTimestamp = withdrawal.createdAt;

            history.push({
              amount: withdrawal.amount,
              type: typeIncoming,
              timestamp: itemTimestamp,
            });
          });
        }
      }

      if (history.length) {
        history.sort((a, b) => (a.timestamp > b.timestamp ? 1 : -1));

        // calc
        history.map((item) => {
          let itemAmount = Math.abs(item.amount);

          switch (item.type) {
            case typeIncoming:
              getUserFunds = getUserFunds + itemAmount;
              break;
            case typeBonusIncoming:
              getBonusFunds = getBonusFunds + itemAmount;
            case typeOutgoing:
              if (itemAmount > getUserFunds) {
                let leftFunds = Math.abs(getUserFunds - itemAmount);

                getBonusFunds = getBonusFunds - leftFunds;
                getUserFunds = 0.0;
              } else {
                getUserFunds = getUserFunds - itemAmount;
              }
              break;
          }
        });
        // get last timestamp
        let lastKey = history.length - 1;
        let lastTimestamp =
          lastKey !== null ? history[lastKey].timestamp : null;
      }

      // timestamp
      const createdAtTimestamp = lastTimestamp ? lastTimestamp : Date.now();

      return {
        userFunds: getUserFunds,
        bonusFunds: getBonusFunds,
        timestamp: createdAtTimestamp,
      };
    } catch (err) {
      this.logger.error(err, "Calc Potential Profit Error");
    }
  }

  private async getLastPotentialProfitFromRolls(userId: string) {
    try {
      let userFunds: any = null;
      let bonusFunds: any = null;
      let createdAtTimestamp: any = null;

      const diceInvader = await this.gameRollServise.getLastPotentialProfit(
        userId
      );

      // get from last roll

      if (diceInvader) {
        userFunds = diceInvader.potential_profit[0]
          ? diceInvader.potential_profit[0]
          : null;
        bonusFunds = diceInvader.potential_profit[1]
          ? diceInvader.potential_profit[1]
          : null;
        createdAtTimestamp = diceInvader.created_at;
      }

      return {
        userFunds,
        bonusFunds,
        timestamp: createdAtTimestamp,
      };
    } catch (err) {
      this.logger.error(err, "Get Last Potential Profit From Roll Error");
    }
  }

  private async checkPotentialProfitRelevance(userId: string, timestamp: Date) {
    try {
      const fromTime = new Date(timestamp);

      const anyDeposits = await this.userDepositsService.findByUserIdAndStatusAndDate(
        userId,
        fromTime
      );

      const anyWithdrawals = await this.userWithdrawalsServise.findByUserIdAndStatusAndDate(
        userId,
        fromTime
      );

      const anyBonusesOrCredits = await this.userBonusesServise.findByUserIdAndDate(
        userId,
        fromTime
      );

      let anyBankrollInvestmentsOrWithdrawals: any = false;
      let anyHouseCategoryWithdrawals: any = false;

      const investor = await this.investorServise.findByUserId(userId);

      if (investor) {
        anyBankrollInvestmentsOrWithdrawals = this.investorHistoryServise.findByInvestorAndDate(
          investor.id,
          fromTime
        );
      }

      const house = await this.bankrollHouseCategoryServise.findByUserId(
        userId
      );

      if (house) {
        anyHouseCategoryWithdrawals = this.bankrollHouseHistoryServise.findByCategoryAndTypeAndDate(
          house.id,
          fromTime
        );
      }

      return !(
        anyDeposits ||
        anyWithdrawals ||
        anyBonusesOrCredits ||
        anyBankrollInvestmentsOrWithdrawals ||
        anyHouseCategoryWithdrawals
      );
    } catch (err) {
      this.logger.error(err, "Check Potential Profit Relevant Error");
    }
  }

  private async getPotentialProfitFromCache(userId: string) {
    const res = await this.cacheManager.get(`USER_${userId}_POTENTIAL_PROFIT`);

    if (res) {
      return this.parsePotentialProfit(String(res));
    }

    return [null, null];
  }

  private async getRollTimeFromCache(userId: string) {
    const date: string = await this.cacheManager.get(
      `USER_${userId}_ROLL_TIME`
    );
    return new Date(date);
  }

  private parsePotentialProfit(value: string) {
    const res = value.split("-");

    return [res[0] ?? null, res[1] ?? null];
  }

  public makePotentialProfitValue(userFunds: number, bonusFunds: number) {
    return userFunds + " - " + bonusFunds;
  }

  public async updatePotentialProfitCache(
    userId: string,
    userFunds: number,
    bonusFunds: number,
    timestamp: Date
  ) {
    let timeVar = "USER_{$userId}_ROLL_TIME";
    let potentialProfitVar = "USER_{$userId}_POTENTIAL_PROFIT";
    let potentialProfitVal = this.makePotentialProfitValue(
      userFunds,
      bonusFunds
    );
    let timeLimit = 3600;

    await this.cacheManager.set(timeVar, timestamp, { ttl: timeLimit });
    await this.cacheManager.set(potentialProfitVar, potentialProfitVal, {
      ttl: timeLimit,
    });
  }

  public async giveToWallet(userId: string, amount: number) {
    const user = await this.getUserById(userId);

    const giveAmount = Math.abs(amount);
    const userBalance = user.balance;

    user.balance = userBalance + giveAmount;

    return user.save();
  }

  public async clearUserPotentialProfitCache(userId: string) {
    const timeVar = `USER_${userId}_ROLL_TIME`;
    const potentialProfitVar = `USER_${userId}_POTENTIAL_PROFIT`;

    await this.cacheManager.del(timeVar);
    await this.cacheManager.del(potentialProfitVar);
  }
}
