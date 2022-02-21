import { CacheModule, forwardRef, Module } from "@nestjs/common";
import { DragonGamesService } from "./dragon-games.service";
import { DragonGamesController } from "./dragon-games.controller";
import { SequelizeModule } from "@nestjs/sequelize";
import { DragonGame } from "./dragon-games.model";
import { GameRollsModule } from "../game-rolls/game-rolls.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { User } from "../users/users.model";
import { BancrollSettingsModule } from "../bancroll-settings/bancroll-settings.module";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";

@Module({
  imports: [
    SequelizeModule.forFeature([DragonGame, User, BancrollSetting]),
    GameRollsModule,
    AuthModule,
    UsersModule,
    CacheModule.register(),
  ],
  exports: [DragonGamesService],
  controllers: [DragonGamesController],
  providers: [DragonGamesService],
})
export class DragonGamesModule {}
