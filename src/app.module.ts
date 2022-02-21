import { Module, CacheModule, CacheInterceptor } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { UsersModule } from "./users/users.module";
import { ConfigModule } from "@nestjs/config";
import { User } from "./users/users.model";
import { RolesModule } from "./roles/roles.module";
import { Role } from "./roles/roles.model";
import { UserRoles } from "./roles/user-roles.model";
import { AuthModule } from "./auth/auth.module";
import { GameRollsModule } from "./game-rolls/game-rolls.module";
import { GameRoll } from "./game-rolls/game-rolls.model";
import { GameSettingsModule } from "./game-settings/game-settings.module";
import { SettingsModule } from "./settings/settings.module";
import { UserBonusesModule } from "./user-bonuses/user-bonuses.module";
import { UserSeedsModule } from "./user-seeds/user-seeds.module";
import { Setting } from "./settings/settings.model";
import { GameSetting } from "./game-settings/game-settings.model";
import { UserSeed } from "./user-seeds/user-seeds.model";
import { MailerModule } from "@nestjs-modules/mailer";
import { BancrollSettingsModule } from "./bancroll-settings/bancroll-settings.module";
import { BancrollSetting } from "./bancroll-settings/bancroll-settings.model";
import { BankrollHouseHistoryModule } from "./bankroll-house-history/bankroll-house-history.module";
import { APP_INTERCEPTOR } from "@nestjs/core";
import { UserDepositsModule } from "./user-deposits/user-deposits.module";
import { BancrollInvestorHistory } from "./bancroll-investor-history/bancroll-investor-history.model";
import { BancrollInvestorHistoryModule } from "./bancroll-investor-history/bancroll-investor-history.module";
import { BankrollHouseCategoryModule } from "./bankroll-house-category/bankroll-house-category.module";
import { BankrollInvestorsModule } from "./bankroll-investors/bankroll-investors.module";
import { UserBonus } from "./user-bonuses/user-bonuses.model";
import { UserDeposit } from "./user-deposits/user-deposits.model";
import { BankrollInvestor } from "src/bankroll-investors/bankroll-investors.model";
import { UserWithdraw } from "./user-withdraws/user-withdraws.model";
import { UserWithdrawsModule } from "./user-withdraws/user-withdraws.module";
import { ProbablyFairModule } from "./probably-fair/probably-fair.module";
import { AppGateway } from "./app.gateway";
import { ChatModule } from "./chat/chat.module";
import { Chat } from "./chat/chat.model";
import { ScheduleModule } from "@nestjs/schedule";
import { CronService } from "./cron/cron.service";
import { DragonGamesModule } from "./dragon-games/dragon-games.module";
import { DragonGame } from "./dragon-games/dragon-games.model";
import { AdminModule } from "./admin/admin.module";
import { EventService } from "./event/event.service";
import { TempProfitModule } from "./temp-profit/temp-profit.module";
import { TempProfit } from "./temp-profit/temp-profit.model";

@Module({
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: CacheInterceptor,
    },
    AppGateway,
    CronService,
    EventService,
  ],
  imports: [
    ScheduleModule.forRoot(),
    CacheModule.register(),
    ConfigModule.forRoot({
      envFilePath: `.${process.env.NODE_ENV}.env`,
    }),
    MailerModule.forRoot({
      transport: {
        host: process.env.SMTP_HOST,
        port: process.env.SMTP_PORT,
        secure: false,
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD,
        },
      },
      defaults: {
        from: '"No Reply" <no-reply@localhost>',
      },
      preview: true,
    }),
    SequelizeModule.forRoot({
      dialect: "postgres",
      host: process.env.POSTGRES_HOST,
      port: Number(process.env.POSTGRESS_PORT),
      username: process.env.POSTGRES_USER,
      password: process.env.POSTGRESS_PASSWORD,
      database: process.env.POSTGRES_DB,
      logging: false,
      models: [
        User,
        Role,
        UserRoles,
        GameRoll,
        GameSetting,
        Setting,
        UserBonus,
        UserWithdraw,
        UserSeed,
        UserDeposit,
        BancrollInvestorHistory,
        BancrollSetting,
        BankrollInvestor,
        Chat,
        DragonGame,
        TempProfit,
      ],
      autoLoadModels: true,
      dialectOptions: {
        requestTimeout: 300000,
      },
    }),
    UsersModule,
    RolesModule,
    GameRollsModule,
    AuthModule,
    GameSettingsModule,
    SettingsModule,
    UserBonusesModule,
    UserSeedsModule,
    UserDepositsModule,
    UserWithdrawsModule,
    BancrollSettingsModule,
    BancrollInvestorHistoryModule,
    BankrollInvestorsModule,
    BankrollHouseCategoryModule,
    BankrollHouseHistoryModule,
    ProbablyFairModule,
    ChatModule,
    DragonGamesModule,
    AdminModule,
    TempProfitModule,
  ],
})
export class AppModule {}
