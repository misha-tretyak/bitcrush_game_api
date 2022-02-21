import { forwardRef, Module } from "@nestjs/common";
import { GameSettingsService } from "./game-settings.service";
import { GameSettingsController } from "./game-settings.controller";
import { AuthModule } from "src/auth/auth.module";
import { RolesModule } from "src/roles/roles.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { Role } from "src/roles/roles.model";
import { UserRoles } from "src/roles/user-roles.model";
import { User } from "src/users/users.model";
import { GameSetting } from "./game-settings.model";
import { UsersModule } from "src/users/users.module";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { BancrollSettingsModule } from "../bancroll-settings/bancroll-settings.module";
import { GameRollsModule } from "../game-rolls/game-rolls.module";

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      UserRoles,
      GameSetting,
      BancrollSetting,
    ]),
    RolesModule,
    BancrollSettingsModule,
    GameRollsModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
  ],
  exports: [GameSettingsService],
  controllers: [GameSettingsController],
  providers: [GameSettingsService],
})
export class GameSettingsModule {}
