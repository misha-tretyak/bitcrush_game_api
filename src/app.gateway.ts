import { Logger, UseGuards } from "@nestjs/common";
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { GameRollsService } from "./game-rolls/game-rolls.service";
// import { UsersService } from "./users/users.service";
// import { TempProfitService } from "./chat/chat.service";
import { GameSettingsService } from "./game-settings/game-settings.service";
import { WSJwtAuthGuard } from "./auth/ws-jwt-auth.guard";

interface StatisticPayload {
  user_id: string;
  offset: string;
  limit: string;
}

// interface IMessage {
//   from_user_id: string;
//   to_user_id: string | null;
//   message: string;
// }

type ITypeCondition = "minus" | "zero" | "plus";

interface IAutoRollSettings {
  stopLossSum: number | null;
  takeProfitSum: number | null;
  numberOfAutoRolls: number | null;
  autoRollSpeed: number;
}

interface ICondition {
  onWin: {
    mainBet: {
      type: ITypeCondition;
      percent: number;
    };
    typeBet: {
      type: ITypeCondition;
      percent: number;
    };
    colorBet: {
      type: ITypeCondition;
      percent: number;
    };
  };
  onLoss: {
    mainBet: {
      type: ITypeCondition;
      percent: number;
    };
    typeBet: {
      type: ITypeCondition;
      percent: number;
    };
    colorBet: {
      type: ITypeCondition;
      percent: number;
    };
  };
}

interface IRollData {
  colorBet: number | null;
  isAuto: boolean;
  mainBet: number;
  selectedColor: number | null;
  selectedRange: string;
  selectedType: number | null;
  typeBet: number | null;
  user_id: string;
  user_seed_id: string;
}

interface IRollResult {
  roll_result: number;
  is_winner: boolean;
  profit: number;
  profit_main: number;
  profit_type: number | null;
  profit_color: number | null;
  main_bet: number;
  type_bet: number | null;
  color_bet: number | null;
  new_balance: number | null;
  number_of_rolls?: number;
}

const ActivePlayers: { user_id: string; socket_id: string }[] = [];

@WebSocketGateway({
  cors: true,
  rememberTransport: false,
  transports: ["websocket"],
  perMessageDeflate: true,
  pingInterval: 10000,
  pingTimeout: 5000,
  cookie: false,
  upgrade: false,
  path: "/ws",
})
export class AppGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect {
  constructor(
    private readonly gameRollsService: GameRollsService,
    private readonly gameSettingsService: GameSettingsService // private readonly userService: UsersService, // private readonly chatService: TempProfitService
  ) {}

  @WebSocketServer() server: Server;
  private logger: Logger = new Logger("AppGateway");

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("all_bets")
  async handleAllBets(client: Socket, message: string) {
    try {
      const { offset, limit }: StatisticPayload = JSON.parse(message);
      const socketClient = this.server.sockets.sockets.get(client.id);
      let interval: any;
      const sendData = async () => {
        const all_bets_res = await this.gameRollsService.lastBets({
          offset,
          limit,
        });
        socketClient.emit("all_bets", JSON.stringify(all_bets_res), client.id);
      };
      socketClient.on("disconnect", () => {
        clearInterval(interval);
      });
      socketClient.on("off_all_bets", () => {
        clearInterval(interval);
      });
      if (limit && offset) {
        sendData().finally();
        interval = setInterval(() => {
          sendData();
        }, 2000);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("statistic")
  async handleStatistic(client: Socket, message: string) {
    try {
      const { offset, limit, user_id }: StatisticPayload = JSON.parse(message);
      const socketClient = this.server.sockets.sockets.get(client.id);
      let interval: any;
      const sendData = async () => {
        const statistic_res = await this.gameRollsService.stats({
          offset,
          limit,
          user_id,
        });
        const stats_res = await this.gameRollsService.statistics(user_id);
        socketClient.emit(
          "statistic",
          JSON.stringify({ statistic: statistic_res, stats: stats_res }),
          user_id
        );
      };
      socketClient.on("disconnect", () => {
        clearInterval(interval);
      });
      socketClient.on("off_statistic", () => {
        clearInterval(interval);
      });

      if (user_id && limit && offset) {
        sendData().finally();
        interval = setInterval(() => {
          sendData();
        }, 1000);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("history")
  async handleMyHistory(client: Socket, query: any) {
    try {
      query = JSON.parse(query);
      const socketClient = this.server.sockets.sockets.get(client.id);
      let interval: any;
      const sendData = async () => {
        const history_res = await this.gameRollsService.myBetsHistory(query);
        socketClient.emit(
          "history",
          JSON.stringify(history_res),
          query.user_id
        );
      };
      socketClient.on("disconnect", () => {
        clearInterval(interval);
      });
      socketClient.on("off_history", () => {
        clearInterval(interval);
      });
      if (query.user_id && query.limit && query.offset) {
        sendData().finally();
        interval = setInterval(() => {
          sendData();
        }, 1000);
      }
    } catch (e) {
      this.logger.error(e);
    }
  }

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("leaderboard")
  async handleLeaderboard(client: Socket) {
    const socketClient = this.server.sockets.sockets.get(client.id);
    try {
      let interval: any;
      socketClient.on("disconnect", () => {
        clearInterval(interval);
      });
      socketClient.on("off_leaderboard", () => {
        clearInterval(interval);
      });
      const sendData = async () => {
        const leaderboard_res = await this.gameRollsService.leaderboard();
        socketClient.emit("leaderboard", JSON.stringify(leaderboard_res));
      };
      sendData().finally();
      interval = setInterval(() => {
        sendData().finally();
      }, 2000);
    } catch (e) {
      this.logger.error(e);
    }
  }

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("settings")
  async handleSettings(client: Socket) {
    try {
      const socketClient = this.server.sockets.sockets.get(client.id);
      let interval: any;
      socketClient.on("disconnect", () => {
        clearInterval(interval);
      });
      const sendData = async () => {
        const side_bet = await this.gameSettingsService
          .findOneByKey("side_bet_chance")
          .finally();
        const house_edge_res = await this.gameSettingsService
          .findOneByKey("house_edge")
          .finally();
        const house_edge = house_edge_res ? +house_edge_res.value : 0;
        const side_bet_chance = side_bet ? +side_bet.value : 0;
        const max_win = await this.gameRollsService.getMaxWin();
        const max_bet = await this.gameRollsService.getMaxBet();
        const settings = { side_bet_chance, house_edge, max_win, max_bet };
        socketClient.emit("settings", JSON.stringify(settings));
      };
      sendData().finally();
      interval = setInterval(() => {
        sendData().finally();
      }, 10000);
    } catch (e) {
      this.logger.error(e);
      this.logger.error(e.message);
    }
  }

  // @UseGuards(WSJwtAuthGuard)
  @SubscribeMessage("auto_roll")
  async handleAutoRoll(client: Socket, data: any) {
    data = JSON.parse(data);
    const roll_data: IRollData = { ...data.roll_data };
    const roll_condition: ICondition = data.condition;
    const profit_condition: IAutoRollSettings = data.autoRollSettings;
    let number_of_rolls: number | null = profit_condition.numberOfAutoRolls;
    let next_bet: number = 0;
    let session_profit: number = 0;
    let date = new Date(Date.now()).getTime();

    const socketClient = this.server.sockets.sockets.get(client.id);
    const userIDS = ActivePlayers.map((user) => user?.user_id);

    if (userIDS.indexOf(roll_data.user_id) === -1) {
      ActivePlayers.push({
        user_id: roll_data.user_id,
        socket_id: socketClient.id,
      });
    } else {
      number_of_rolls = 0;
    }

    socketClient.on("stop_auto_roll", (message: string, id: string) => {
      if (id) {
        number_of_rolls = 0;

        const index = ActivePlayers.findIndex((item) => {
          return (
            item.user_id === roll_data.user_id &&
            item.socket_id === socketClient.id
          );
        });

        if (index !== -1) {
          ActivePlayers.splice(index, 1);
        }
      }
    });

    socketClient.on("disconnect", () => {
      number_of_rolls = 0;
      ActivePlayers.splice(
        ActivePlayers.findIndex((item) => {
          return (
            item.user_id === roll_data.user_id &&
            item.socket_id === socketClient.id
          );
        }),
        1
      );
    });

    const auto_roll = async (
      data: IRollData,
      condition: ICondition,
      num_of_rolls: number | null,
      speed: number
    ) => {
      setTimeout(async () => {
        const max_bet = await this.gameRollsService.getMaxBet();
        const side_bet_multiplier_ptc = await this.gameSettingsService.findOneByKey(
          "side_bet_multiplier"
        );
        if (num_of_rolls !== null && num_of_rolls !== 0) {
          if (
            profit_condition.stopLossSum &&
            session_profit !== 0 &&
            -profit_condition.stopLossSum >= session_profit - next_bet
          ) {
            //Loss profit
            number_of_rolls = 0;
            this.logger.log(session_profit, "LOSS SUM");
            socketClient.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "stop",
                text: "stop loss protection",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else if (
            profit_condition.takeProfitSum &&
            profit_condition.takeProfitSum < session_profit
          ) {
            //Take profit
            number_of_rolls = 0;
            this.logger.debug(session_profit, "TAKE SUM");
            client.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "profit",
                text: "take profit triggered!",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else if (max_bet <= data.mainBet + data.typeBet + data.colorBet) {
            number_of_rolls = 0;
            this.logger.debug(session_profit, "MAX BET REACHED");
            socketClient.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "bet",
                text: "max bet reached",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else
            try {
              const roll = await this.gameRollsService.roll(data);

              session_profit += roll?.roll?.profit;

              if (roll?.roll?.max_win) {
                this.logger.debug("MAX WIN REACHED");
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "win",
                    text: "max win reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              }

              const new_data = prepare_new_data(
                data,
                condition,
                roll?.roll?.profit_main,
                roll?.roll?.profit_type,
                roll?.roll?.profit_color,
                Number(side_bet_multiplier_ptc.value)
              );

              next_bet = new_data.mainBet;
              next_bet += new_data.selectedType ? new_data.typeBet : 0;
              next_bet += new_data.selectedColor ? new_data.colorBet : 0;

              const roll_result: IRollResult = {
                roll_result: roll?.roll?.roll_result,
                is_winner: roll?.roll?.is_winner,
                profit: roll?.roll?.profit,
                profit_main: roll?.roll?.profit_main,
                profit_type: roll?.roll?.profit_type,
                profit_color: roll?.roll?.profit_color,
                main_bet: new_data?.mainBet,
                type_bet: new_data?.typeBet,
                color_bet: new_data?.colorBet,
                new_balance: roll?.user?.balance,
                number_of_rolls:
                  num_of_rolls - 1 > 0
                    ? num_of_rolls - 1
                    : profit_condition.numberOfAutoRolls,
              };
              socketClient.emit(
                "roll_result",
                JSON.stringify(roll_result),
                roll_data.user_id
              );
              date = new Date(Date.now()).getTime();
              if (roll?.max_win_reached) {
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "win",
                    text: "max win reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else {
                await auto_roll(
                  new_data,
                  condition,
                  number_of_rolls === 0 ? 0 : num_of_rolls - 1,
                  profit_condition.autoRollSpeed
                );
              }
            } catch (e) {
              console.log(e.message);
              if (e.message === "No enough balance to make next Roll") {
                this.logger.error(e.message);
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "balance",
                    text: "insufficient funds",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else if (e?.message?.maxBetReached) {
                this.logger.error(e.message);
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "bet",
                    text: "max bet reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else if (
                e.message ===
                "Your side bet is smaller than allowed: 1 CC or 25% from your main bet"
              ) {
                this.logger.debug("Side Bet Not allowed");
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
              } else {
                this.logger.error(e);
                this.logger.error(e.message);
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "error",
                    text: "server error",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              }
            }
        } else if (num_of_rolls === null && num_of_rolls !== 0) {
          if (
            profit_condition.stopLossSum &&
            session_profit !== 0 &&
            -profit_condition.stopLossSum >= session_profit - next_bet
          ) {
            //Loss profit
            number_of_rolls = 0;
            this.logger.log(session_profit, "LOSS SUM");
            socketClient.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "stop",
                text: "stop loss protection",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else if (
            profit_condition.takeProfitSum &&
            profit_condition.takeProfitSum <= session_profit
          ) {
            //Take profit
            number_of_rolls = 0;
            this.logger.debug(session_profit, "TAKE SUM");
            socketClient.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "profit",
                text: "take profit triggered!",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else if (max_bet < data.mainBet + data.typeBet + data.colorBet) {
            number_of_rolls = 0;
            this.logger.debug(session_profit, "MAX BET REACHED");
            socketClient.emit("stop_auto_roll", "", roll_data.user_id);
            socketClient.emit(
              "notification",
              JSON.stringify({
                type: "bet",
                text: "max bet reached",
                isShow: true,
              }),
              roll_data.user_id
            );
          } else
            try {
              const roll = await this.gameRollsService.roll(data);
              session_profit += roll?.roll?.profit;

              if (roll?.roll?.max_win) {
                this.logger.debug("MAX WIN REACHED");
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "win",
                    text: "max win reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              }

              const new_data = prepare_new_data(
                data,
                condition,
                roll?.roll?.profit_main,
                roll?.roll?.profit_type,
                roll?.roll?.profit_color,
                Number(side_bet_multiplier_ptc.value)
              );

              next_bet = new_data.mainBet;
              next_bet += new_data.selectedType ? new_data.typeBet : 0;
              next_bet += new_data.selectedColor ? new_data.colorBet : 0;

              const roll_result: IRollResult = {
                roll_result: roll?.roll?.roll_result,
                is_winner: roll?.roll?.is_winner,
                profit: roll?.roll?.profit,
                profit_main: roll?.roll?.profit_main,
                profit_type: roll?.roll?.profit_type,
                profit_color: roll?.roll?.profit_color,
                main_bet: new_data?.mainBet,
                new_balance: roll?.user?.balance,
                type_bet: new_data?.typeBet,
                color_bet: new_data?.colorBet,
              };
              socketClient.emit(
                "roll_result",
                JSON.stringify(roll_result),
                roll_data.user_id
              );

              date = new Date(Date.now()).getTime();
              if (roll?.max_win_reached) {
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "win",
                    text: "max win reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else {
                await auto_roll(
                  new_data,
                  condition,
                  number_of_rolls,
                  profit_condition.autoRollSpeed
                );
              }
            } catch (e) {
              if (e.message === "No enough balance to make next Roll") {
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "balance",
                    text: "insufficient funds",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else if (e?.message?.maxBetReached) {
                this.logger.error(e.message);
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "bet",
                    text: "max bet reached",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              } else if (
                e.message ===
                "Your side bet is smaller than allowed: 1 CC or 25% from your main bet"
              ) {
                this.logger.debug("Side Bet not Allowed");
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
              } else {
                this.logger.error(e);
                this.logger.error(e.message);
                socketClient.emit("stop_auto_roll", "", roll_data.user_id);
                socketClient.emit(
                  "notification",
                  JSON.stringify({
                    type: "error",
                    text: "server error",
                    isShow: true,
                  }),
                  roll_data.user_id
                );
              }
            }
        } else if (num_of_rolls === 0) {
          socketClient.emit("stop_auto_roll", "", roll_data.user_id);
        }
      }, speed);
    };

    const calc_percentage = (number: number, percent: number) => {
      return (number / 100) * percent;
    };

    const prepare_new_data = (
      roll_data_temp: IRollData,
      condition: ICondition,
      profit_main: number,
      profit_type: number,
      profit_color: number,
      side_bet_multiplier_ptc: number
    ): IRollData => {
      if (profit_main > 0) {
        if (condition.onWin.mainBet.type === "plus") {
          roll_data_temp.mainBet += calc_percentage(
            roll_data_temp.mainBet,
            condition.onWin.mainBet.percent
          );
        }

        if (condition.onWin.mainBet.type === "minus") {
          roll_data_temp.mainBet -= calc_percentage(
            roll_data_temp.mainBet,
            condition.onWin.mainBet.percent
          );
        }

        if (condition.onWin.mainBet.type === "zero") {
          roll_data_temp.mainBet = data.roll_data.mainBet;
        }
      } else {
        if (condition.onLoss.mainBet.type === "plus") {
          roll_data_temp.mainBet += calc_percentage(
            roll_data_temp.mainBet,
            condition.onLoss.mainBet.percent
          );
        }

        if (condition.onLoss.mainBet.type === "minus") {
          roll_data_temp.mainBet -= calc_percentage(
            roll_data_temp.mainBet,
            condition.onLoss.mainBet.percent
          );
        }
        if (condition.onLoss.mainBet.type === "zero") {
          roll_data_temp.mainBet = data.roll_data.mainBet;
        }
      }

      if (+profit_type > 0) {
        if (condition.onWin.typeBet.type === "plus") {
          roll_data_temp.typeBet += calc_percentage(
            roll_data_temp.typeBet,
            condition.onWin.typeBet.percent
          );
        }
        if (condition.onWin.typeBet.type === "minus") {
          roll_data_temp.typeBet -= calc_percentage(
            roll_data_temp.typeBet,
            condition.onWin.typeBet.percent
          );
        }
        if (condition.onWin.typeBet.type === "zero") {
          roll_data_temp.typeBet = data.roll_data.typeBet;
        }
      } else {
        if (condition.onLoss.typeBet.type === "plus") {
          roll_data_temp.typeBet += calc_percentage(
            roll_data_temp.typeBet,
            condition.onLoss.typeBet.percent
          );
        }
        if (condition.onLoss.typeBet.type === "minus") {
          roll_data_temp.typeBet -= calc_percentage(
            roll_data_temp.typeBet,
            condition.onLoss.typeBet.percent
          );
        }
        if (condition.onLoss.typeBet.type === "zero") {
          roll_data_temp.typeBet = data.roll_data.typeBet;
        }
      }

      if (profit_color > 0) {
        if (condition.onWin.colorBet.type === "plus") {
          roll_data_temp.colorBet += calc_percentage(
            roll_data_temp.colorBet,
            condition.onWin.colorBet.percent
          );
        }
        if (condition.onWin.colorBet.type === "minus") {
          roll_data_temp.colorBet -= calc_percentage(
            roll_data_temp.colorBet,
            condition.onWin.colorBet.percent
          );
        }
        if (condition.onWin.colorBet.type === "zero") {
          roll_data_temp.colorBet = data.roll_data.colorBet;
        }
      } else {
        if (condition.onLoss.colorBet.type === "plus") {
          roll_data_temp.colorBet += calc_percentage(
            roll_data_temp.colorBet,
            condition.onLoss.colorBet.percent
          );
        }
        if (condition.onLoss.colorBet.type === "minus") {
          roll_data_temp.colorBet -= calc_percentage(
            roll_data_temp.colorBet,
            condition.onLoss.colorBet.percent
          );
        }
        if (condition.onLoss.colorBet.type === "zero") {
          roll_data_temp.colorBet = data.roll_data.colorBet;
        }
      }
      if (roll_data_temp.mainBet < 1) {
        roll_data_temp.mainBet = 1;
      }
      const side_bet_multiplier =
        roll_data_temp.mainBet * side_bet_multiplier_ptc;

      if (roll_data_temp.typeBet < 1) {
        roll_data_temp.typeBet = 1;
      }
      if (roll_data_temp.colorBet < 1) {
        roll_data_temp.colorBet = 1;
      }
      if (roll_data_temp.typeBet < side_bet_multiplier) {
        roll_data_temp.typeBet = side_bet_multiplier;
      }
      if (roll_data_temp.colorBet < side_bet_multiplier) {
        roll_data_temp.colorBet = side_bet_multiplier;
      }
      return roll_data_temp;
    };
    try {
      await auto_roll(roll_data, roll_condition, number_of_rolls, 0);
    } catch (e) {
      this.logger.error(e.message);
    }
  }

  // @SubscribeMessage("new_message")
  // async handleNewMessage(
  //   client: Socket,
  //   { from_user_id, to_user_id, message }: IMessage
  // ) {
  //   let to_user;
  //   if (to_user_id) {
  //     to_user = await this.userService.getUserByWalletAddress(to_user_id);
  //     to_user_id = to_user.id;
  //   } else {
  //     to_user_id = null;
  //   }
  //   if (from_user_id && message) {
  //     await this.chatService.create({ from_user_id, to_user_id, message });
  //     await this.handleMessages(client, {});
  //   }
  // }
  //
  // @SubscribeMessage("messages")
  // async handleMessages(
  //   client: Socket,
  //   query: { offset?: string; limit?: string }
  // ) {
  //   const messages = await this.chatService.findAll(query);
  //   this.server.emit("messages", JSON.stringify(messages), client.id);
  // }

  afterInit(server: Server) {}

  async handleConnection(client: Socket) {}

  handleDisconnect(client: Socket) {}
}
