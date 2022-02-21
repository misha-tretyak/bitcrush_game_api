import { Injectable, Logger } from "@nestjs/common";
import { Interval, SchedulerRegistry } from "@nestjs/schedule";
import { GameRollsService } from "../game-rolls/game-rolls.service";
import { GameSettingsService } from "../game-settings/game-settings.service";

let sync_time = 300000;
let lock_users: ILockUsers[] = [];
let unblock_users: string[] = [];
let block_time = 10000;
let unblock_time = 600000;

interface ILockUsers {
  wallet: string;
  time: number;
}

@Injectable()
export class CronService {
  constructor(
    private readonly gameRollRepository: GameRollsService,
    private readonly gameSettingsRepository: GameSettingsService,
    private schedulerRegistry: SchedulerRegistry
  ) {}

  private logger: Logger = new Logger("CronService");

  @Interval("block_users_withdraw", block_time)
  async runBlockUsers() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        const time = await this.gameSettingsRepository.findOneByKey(
          "block_users_time"
        );
        if (lock_users.length) {
          lock_users.map((user, i) => {
            if (
              new Date(Date.now()).getTime() - user.time >
              Number(time.value) * 1000
            ) {
              unblock_users.push(user.wallet);
              lock_users.splice(i, 1);
            }
          });
        }

        let locks: string[] = [];
        const users = await this.gameRollRepository.findAllWhoPlay(
          +time.value * 1000
        );

        if (unblock_users.length) {
          unblock_users.map((wallet, i) => {
            if (users.indexOf(wallet) !== -1) {
              unblock_users.splice(i, 1);
            }
          });
        }
        if (lock_users.length && users.length) {
          let already_blocked = [];
          users.map((wallet) => {
            const blocked_wallet = lock_users.filter(
              (user) => user.wallet === wallet
            );
            if (blocked_wallet.length > 0) {
              already_blocked.push(blocked_wallet[0].wallet);
            }
          });
          users.map((user) => {
            if (already_blocked.indexOf(user) === -1) {
              locks.push(user);
            }
          });
        } else {
          locks = [...users];
        }

        if (locks.length) {
          locks = [...new Set(locks)];
          this.logger.debug(locks?.length, "USERS TO LOCK");
          locks.map((user_wallet: string) => {
            lock_users.push({
              wallet: user_wallet,
              time: new Date().getTime(),
            });
          });
          const res = await this.gameRollRepository.blockUsersWithdraw(locks);
          if (res) {
            locks = [];
          }
        }
      } catch (e) {
        this.logger.error(e, "ERROR BLOCK USERS");
      }
    }
  }

  @Interval("unblock_users_withdraw", unblock_time)
  async runUnblockUsers() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        if (unblock_users.length) {
          unblock_users = [...new Set(unblock_users)];
          this.logger.debug(unblock_users?.length, "USERS TO UNLOCK");
          const res = await this.gameRollRepository.unblockUsersWithdraw(
            unblock_users
          );

          if (res) {
            unblock_users = [];
          }
        }
      } catch (e) {
        this.logger.error(e, "ERROR UNLOCK USERS WITHDRAW");
      }
    }
  }

  @Interval("sync_balances", sync_time)
  async runSyncBalances() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        this.logger.debug("SYNC USERS BALANCE BY TIME", sync_time.toString());
        await this.gameRollRepository.sendDataToBlockchain();
      } catch (e) {
        this.logger.error(e, "ERROR SYNC USERS BALANCE");
      }
    }
  }

  @Interval(60000)
  async runChangeTimeSyncBalances() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        let new_time = await this.gameSettingsRepository.findOneByKey(
          "sync_balance_sec"
        );
        if (+new_time?.value * 1000 !== sync_time) {
          this.schedulerRegistry.deleteInterval("sync_balances");
          const callback = async () => {
            if (process.env.NODE_APP_INSTANCE === "0") {
              try {
                this.logger.debug(
                  "SYNC USERS BALANCE BY TIME",
                  sync_time.toString()
                );
                await this.gameRollRepository.sendDataToBlockchain();
              } catch (e) {
                this.logger.error(e, "ERROR SYNC USERS BALANCE");
              }
            }
          };
          const interval = setInterval(callback, +new_time.value * 1000);
          this.schedulerRegistry.addInterval("sync_balances", interval);
          sync_time = +new_time?.value * 1000;
          this.logger.debug("CHANGE TIME SYNC BALANCES");
        }
      } catch (e) {
        this.logger.error(e, "ERROR CHANGE SYNC USERS BALANCE INTERVAL TIME");
      }
    }
  }

  @Interval(120000)
  async runChangeTimeUnlockUsers() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        let new_time = await this.gameSettingsRepository.findOneByKey(
          "unblock_user_interval"
        );

        if (+new_time?.value * 1000 !== unblock_time) {
          this.schedulerRegistry.deleteInterval("unblock_users_withdraw");
          const callback = async () => {
            try {
              if (unblock_users.length) {
                unblock_users = [...new Set(unblock_users)];
                this.logger.debug(unblock_users?.length, "USERS TO UNLOCK");
                const res = await this.gameRollRepository.unblockUsersWithdraw(
                  unblock_users
                );

                if (res) {
                  unblock_users = [];
                }
              }
            } catch (e) {
              this.logger.error(e);
            }
          };
          const interval = setInterval(callback, +new_time.value * 1000);
          this.schedulerRegistry.addInterval(
            "unblock_users_withdraw",
            interval
          );
          unblock_time = +new_time?.value * 1000;
          this.logger.debug("CHANGE TIME UNLOCK USERS");
        }
      } catch (e) {
        this.logger.error(e, "ERROR CHANGE UNLOCK USERS INTERVAL TIME");
      }
    }
  }

  @Interval(120000)
  async runChangeTimeBlockUsers() {
    if (process.env.NODE_APP_INSTANCE === "0") {
      try {
        let new_time = await this.gameSettingsRepository.findOneByKey(
          "block_user_interval"
        );

        if (+new_time?.value * 1000 !== block_time) {
          this.schedulerRegistry.deleteInterval("block_users_withdraw");
          const callback = async () => {
            try {
              const time = await this.gameSettingsRepository.findOneByKey(
                "block_users_time"
              );
              if (lock_users.length) {
                lock_users.map((user, i) => {
                  if (
                    new Date(Date.now()).getTime() - user.time >
                    Number(time.value) * 1000
                  ) {
                    unblock_users.push(user.wallet);
                    lock_users.splice(i, 1);
                  }
                });
              }

              let locks: string[] = [];
              const users = await this.gameRollRepository.findAllWhoPlay(
                +time.value * 1000
              );

              if (unblock_users.length) {
                unblock_users.map((wallet, i) => {
                  if (users.indexOf(wallet) !== -1) {
                    unblock_users.splice(i, 1);
                  }
                });
              }
              if (lock_users.length && users.length) {
                let already_blocked = [];
                users.map((wallet) => {
                  const blocked_wallet = lock_users.filter(
                    (user) => user.wallet === wallet
                  );
                  if (blocked_wallet.length > 0) {
                    already_blocked.push(blocked_wallet[0].wallet);
                  }
                });
                users.map((user) => {
                  if (already_blocked.indexOf(user) === -1) {
                    locks.push(user);
                  }
                });
              } else {
                locks = [...users];
              }

              if (locks.length) {
                locks = [...new Set(locks)];
                this.logger.debug(locks?.length, "USERS TO LOCK");
                locks.map((user_wallet: string) => {
                  lock_users.push({
                    wallet: user_wallet,
                    time: new Date().getTime(),
                  });
                });
                const res = await this.gameRollRepository.blockUsersWithdraw(
                  locks
                );
                if (res) {
                  locks = [];
                }
              }
            } catch (e) {
              this.logger.error(e, "ERROR BLOCK USERS");
            }
          };
          const interval = setInterval(callback, +new_time.value * 1000);
          this.schedulerRegistry.addInterval("block_users_withdraw", interval);
          block_time = +new_time?.value * 1000;
          this.logger.debug("CHANGE TIME LOCK USERS");
        }
      } catch (e) {
        this.logger.error(e, "ERROR CHANGE BLOCK USERS INTERVAL TIME");
      }
    }
  }
}
