import { forwardRef, Module } from "@nestjs/common";
import { UsersController } from "./users.controller";
import { UsersService } from "./users.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "./users.model";
import { Role } from "../roles/roles.model";
import { UserRoles } from "../roles/user-roles.model";
import { RolesModule } from "../roles/roles.module";
import { AuthModule } from "../auth/auth.module";
import { GameRoll } from "../game-rolls/game-rolls.model";
import { GameRollsModule } from "src/game-rolls/game-rolls.module";
import { UserBonusesModule } from "src/user-bonuses/user-bonuses.module";
import { UserBonus } from "src/user-bonuses/user-bonuses.model";
import { UserDeposit } from "src/user-deposits/user-deposits.model";
import { UserWithdraw } from "src/user-withdraws/user-withdraws.model";
import { BancrollInvestorHistory } from "src/bancroll-investor-history/bancroll-investor-history.model";
import { BankrollHouseHistory } from "src/bankroll-house-history/bankroll-house-history.model";
import { CacheModule } from "@nestjs/common";
import { UserDepositsModule } from "../user-deposits/user-deposits.module";
import { UserWithdrawsModule } from "../user-withdraws/user-withdraws.module";
import { BankrollInvestorsModule } from "../bankroll-investors/bankroll-investors.module";
import { BancrollInvestorHistoryModule } from "src/bancroll-investor-history/bancroll-investor-history.module";
import { BankrollHouseHistoryModule } from "src/bankroll-house-history/bankroll-house-history.module";
import { BankrollHouseCategoryModule } from "src/bankroll-house-category/bankroll-house-category.module";
import { UserSeed } from "src/user-seeds/user-seeds.model";
import { ProbablyFairModule } from "../probably-fair/probably-fair.module";
import { GameSetting } from "../game-settings/game-settings.model";
import { GameSettingsModule } from "../game-settings/game-settings.module";
import { TempProfitModule } from "../temp-profit/temp-profit.module";
import { TempProfit } from "../temp-profit/temp-profit.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      UserRoles,
      GameRoll,
      UserBonus,
      UserDeposit,
      UserWithdraw,
      BancrollInvestorHistory,
      BankrollHouseHistory,
      TempProfit,
    ]),
    RolesModule,
    GameRollsModule,
    UserBonusesModule,
    UserDepositsModule,
    UserWithdrawsModule,
    ProbablyFairModule,
    TempProfitModule,
    BankrollInvestorsModule,
    BancrollInvestorHistoryModule,
    BankrollHouseCategoryModule,
    BankrollHouseHistoryModule,
    AuthModule,
    forwardRef(() => GameSettingsModule),
    forwardRef(() => AuthModule),
    CacheModule.register(),
  ],
  exports: [UsersService],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
