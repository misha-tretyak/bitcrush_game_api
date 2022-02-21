import { Injectable, Logger } from "@nestjs/common";
import { CreateDragonGameDto } from "./dto/create-dragon-game.dto";
import { InjectModel } from "@nestjs/sequelize";
import { DragonGame } from "./dragon-games.model";
import { GameRollsService } from "../game-rolls/game-rolls.service";
const Web3 = require("web3");
import * as Config from "../config";
import { AuthService } from "../auth/auth.service";
import { User } from "../users/users.model";
import { ValidationException } from "src/exceptions/validation.exception";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { UsersService } from "../users/users.service";
import Redis from "ioredis";

@Injectable()
export class DragonGamesService {
  constructor(
    @InjectModel(BancrollSetting)
    private readonly bankrollSettingRepository: typeof BancrollSetting,
    @InjectModel(DragonGame)
    private readonly dragonGameRepository: typeof DragonGame,
    private readonly gameRollService: GameRollsService,
    private readonly userService: UsersService,
    private readonly authService: AuthService,
    @InjectModel(User)
    private readonly userRepository: typeof User
  ) { }

  private logger: Logger = new Logger("DragonGamesService");
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
  redis = new Redis();
  async create(createDragonGameDto: CreateDragonGameDto) {
    try {
      createDragonGameDto.wallet_address = createDragonGameDto.wallet_address.toLowerCase();

      let user = await this.userRepository
        .findOne({
          where: { wallet_address: createDragonGameDto.wallet_address },
          attributes: ["balance", "wallet_address"],
        })
        .catch((error) => {
          console.log(error);
        });

      if (!user) {
        try {
          await this.authService.registration({
            wallet_address: createDragonGameDto.wallet_address,
          });
          user = await this.userRepository.findOne({
            where: { wallet_address: createDragonGameDto.wallet_address },
            attributes: ["balance", "wallet_address"],
          });
        } catch (e) {
          console.log(e, "Error with register user");
        }
      }
      

      if (user) {
        let userAdjusted = await this.userService.getUserByWalletAddressForClient(createDragonGameDto.wallet_address);
        user.balance = userAdjusted.balance;
        if (
          user.balance !== 0 &&
          user.balance !== null &&
          user.balance !== undefined
        ) {
          if (user.balance + createDragonGameDto.profit < 0) {
            throw new ValidationException(
              "User doesnt have enough balance to play!"
            );
          } else {
             this.userRepository.increment(
              { balance: createDragonGameDto.profit },
              {
                where: {
                  wallet_address: user.wallet_address
                }
              }).then(()=>{

              });
            /* await this.userService.updateBalance({
              wallet_address: user.wallet_address,
              balance: user.balance + createDragonGameDto.profit,
            }); */
          }
          let redisBal = await this.redis.get(createDragonGameDto.wallet_address.toLowerCase());
          if(redisBal==null){
            await this.redis.set(createDragonGameDto.wallet_address.toLowerCase(),userAdjusted.balance.toFixed());
          }
        } else {
          throw new ValidationException(
            "User Balance must be greater than zero!"
          );
        }
      }

      const result = await this.dragonGameRepository
        .create(createDragonGameDto)
        .catch((error) => {
          console.log(error);
        });
      //if (result) {
      this.gameRollService.addTempProfit(
        createDragonGameDto.profit,
        createDragonGameDto.wallet_address
      );
      //}
      /* try{
        let redisBalance = await this.redis.get(createDragonGameDto.wallet_address);
        redisBalance = redisBalance + createDragonGameDto.profit;
        await this.redis.set(createDragonGameDto.wallet_address, redisBalance);
      }catch(error){
        console.log(error);
      } */
      
        
      let new_balance = await this.userRepository
        .findOne({
          where: { wallet_address: createDragonGameDto.wallet_address },
          attributes: ["balance"],
        })
        .catch((error) => {
          console.log(error);
        });

      return new_balance;
    } catch (err) {
      this.logger.debug(err, "DG Create Error");
    }
  }

  findAll() {
    try {
      return this.dragonGameRepository.findAll();
    } catch (err) {
      this.logger.debug(err, "DG Find All Error");
    }
  }

  async findByWallet(wallet_address: string) {
    try {
      const user = await this.userRepository
        .findOne({
          where: { wallet_address },
          attributes: ["balance"],
        })
        .catch((error) => {
          console.log(error);
        });
      const data = await this.dragonGameRepository
        .findAll({
          where: { wallet_address },
        })
        .catch((error) => {
          console.log(error);
        });
      return {
        balance: user ? user.balance : null,
        data: data,
      };
    } catch (err) {
      this.logger.debug(err, "DG Find By Wallet Error");
    }
  }

  findByGameID(game_id: number) {
    try {
      return this.dragonGameRepository.findAll({ where: { game_id } });
    } catch (err) {
      this.logger.debug(err, "DG Find By Game ID Error");
    }
  }

  async getBankrollBalance() {
    try {
      let bankroll = await this.bankroll.methods.totalBankroll().call();
      let staging = await this.staging.methods.totalStaked().call();
      let frozen = await this.staging.methods.totalFrozen().call();
      staging = this.web3.utils.fromWei(staging.toString());
      frozen = this.web3.utils.fromWei(frozen.toString());
      bankroll = this.web3.utils.fromWei(bankroll.toString());

      const totalBankroll =
        Number(bankroll) + (Number(staging) - Number(frozen));
      const house_ptc = await this.bankrollSettingRepository.findOne({
        where: { key: "house_ptc" },
      });
      const investors_ptc = await this.bankrollSettingRepository.findOne({
        where: { key: "investors_ptc" },
      });
      const house_bankroll = (+house_ptc.value / 100) * totalBankroll;
      const investors_bankroll = (+investors_ptc.value / 100) * totalBankroll;
      return {
        bankroll_balance: +totalBankroll,
        house_bankroll,
        investors_bankroll,
        investors_ptc,
        house_ptc,
      };
    } catch (err) {
      this.logger.debug(err.message, "Get Bankroll Balance");
    }
  }
}
