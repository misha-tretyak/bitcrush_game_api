import { Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { GameSettingsService } from "../game-settings/game-settings.service";
import * as Config from "../config";
import { UsersService } from "../users/users.service";
import { AppGateway } from "../app.gateway";
import { TempProfitService } from "../temp-profit/temp-profit.service";
import { GameRollsService } from "../game-rolls/game-rolls.service";
const Web3 = require("web3");
import { User } from "../users/users.model";
import Redis from "ioredis";
@Injectable()
export class EventService implements OnModuleInit {
  constructor(
    private readonly gameSettingsService: GameSettingsService,
    private readonly userService: UsersService,
    private readonly gatewayService: AppGateway,
    private readonly gameRollServise: GameRollsService,
    private readonly tempProfitRepository: TempProfitService,
  ) {}

  private logger: Logger = new Logger("EventsService");
  provider = new Web3.providers.WebsocketProvider(process.env.NODE_URL_WS, {
    clientConfig: {
      keepalive: true,
      keepaliveInterval: -1,
    },
    reconnect: {
      auto: true,
      delay: 1000,
      onTimeout: true,
      maxAttempts: 50,
    },
  });
  web3 = new Web3(this.provider);
  live_wallet = new this.web3.eth.Contract(
    Config.config.live_wallet.abi,
    Config.config.live_wallet.address
  );
  redis = new Redis();
  async onModuleInit(): Promise<void> {
    if (process.env.NODE_APP_INSTANCE === "0") {
      this.provider.on("close", (err) => {
        this.logger.error("WebSocket connection closed. " + err);
      });

      const that = this;
      let error_withdraw = false;
      let error_deposit = false;
      try {
        this.live_wallet.events
          .Withdraw({}, function (error) {
            error && that.logger.error(error, "ERROR WITHDRAW");
            error_withdraw = error;
          })
          .on("connected", function () {
            that.logger.debug("WITHDRAW CONNECTED");
          })
          .on("data", async function (data) {
            const user = await that.userService.getUserByWalletAddress(
              data.returnValues._address.toLowerCase()
            );
            if (user) {
              that.gatewayService.server.emit("stop_auto_roll", "", user.id);
              that.logger.debug(
                "WITHDRAW",
                data.returnValues._address.toLowerCase()
              );
              await that.changeBalance(
                data.returnValues._address.toLowerCase(),
                Number(that.web3.utils.fromWei(data.returnValues._amount)),
                "-"
              );
            } else {
              that.logger.debug(
                "WITHDRAW USER NOT FOUND",
                data.returnValues._address.toLowerCase()
              );
            }
          });

        this.live_wallet.events
          .Deposit({}, function (error) {
            error && that.logger.error(error, "ERROR DEPOSIT");
            error_deposit = error;
          })
          .on("connected", function () {
            that.logger.debug("DEPOSIT CONNECTED");
          })
          .on("data", async function (data) {
            const user = await that.userService.getUserByWalletAddress(
              data.returnValues._address.toLowerCase()
            );
            if (user) {
              that.gatewayService.server.emit("stop_auto_roll", "", user.id);
              that.logger.debug(
                "DEPOSIT",
                data.returnValues._address.toLowerCase()
              );
              await that.changeBalance(
                data.returnValues._address.toLowerCase(),
                Number(that.web3.utils.fromWei(data.returnValues._amount)),
                "+"
              );
            } else {
              that.logger.debug(
                data.returnValues._address.toLowerCase(),
                "DEPOSIT USER NOT FOUND"
              );
            }
          });
      } catch (e) {
        this.logger.error(e, "ERROR ON EVENTS");
      }
    }
  }

  async changeBalance(wallet: string, amount: number, operation: "-" | "+") {
    try {
      const user = await this.userService.getUserByWalletAddress(wallet);
      const time = await this.gameSettingsService.findOneByKey(
        "block_users_time"
      );
      const users = await this.gameRollServise.findAllWhoPlay(
        +time.value * 1000
      );

      if (users.indexOf(wallet) !== -1) {
        if (user) {
          if (operation === "+") {
            await this.userService.userRepository.increment(
              { balance: amount },
              {
                where: {
                  wallet_address: wallet
                }
              });
            //user.balance = user.balance + amount;
          } else if (operation === "-") {
            await this.userService.userRepository.increment(
              { balance: (amount*-1) },
              {
                where: {
                  wallet_address: wallet
                }
              });
            //user.balance = user.balance - amount;
          }
          /* try {
            this.redis.del(wallet.toLowerCase());
          } catch (error) {
            console.log(error);
          } */
          //await user.save();
          this.gatewayService.server.emit(
            "user_balance",
            JSON.stringify(user.balance),
            user.id
          );
        }
      } else {
        this.gatewayService.server.emit(
          "user_balance",
          JSON.stringify(user.balance),
          user.id
        );
      }
    } catch (e) {
      this.logger.error(e, "ERROR CHANGE USER BALANCE");
    }
  }
}
