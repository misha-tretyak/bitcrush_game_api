import { CacheModule, forwardRef, Module } from "@nestjs/common";
import { GameRollsService } from "./game-rolls.service";
import { GameRollsController } from "./game-rolls.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { GameRoll } from "./game-rolls.model";
import { User } from "../users/users.model";
import { UsersModule } from "src/users/users.module";
import { AuthModule } from "src/auth/auth.module";
import { RolesModule } from "src/roles/roles.module";
import { Role } from "src/roles/roles.model";
import { UserRoles } from "src/roles/user-roles.model";
import { UserSeed } from "src/user-seeds/user-seeds.model";
import { GameSetting } from "../game-settings/game-settings.model";
import { BancrollSetting } from "src/bancroll-settings/bancroll-settings.model";
import { Setting } from "src/settings/settings.model";
import { DragonGame } from "../dragon-games/dragon-games.model";
import { TempProfit } from "../temp-profit/temp-profit.model";
import { TempProfitModule } from "../temp-profit/temp-profit.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      UserRoles,
      UserSeed,
      GameSetting,
      BancrollSetting,
      DragonGame,
      Setting,
      GameRoll,
      TempProfit,
    ]),
    RolesModule,
    TempProfitModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    CacheModule.register(),
  ],
  exports: [GameRollsService],
  controllers: [GameRollsController],
  providers: [GameRollsService],
})
export class GameRollsModule {}
