import { CacheModule, forwardRef, Module } from "@nestjs/common";
import { AdminController } from "./admin.controller";
import { AdminService } from "./admin.service";
import { RolesModule } from "../roles/roles.module";
import { AuthModule } from "../auth/auth.module";
import { UsersModule } from "../users/users.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { User } from "../users/users.model";
import { Role } from "../roles/roles.model";
import { UserRoles } from "../roles/user-roles.model";
import { UserSeed } from "../user-seeds/user-seeds.model";
import { GameSetting } from "../game-settings/game-settings.model";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { Setting } from "../settings/settings.model";
import { GameRoll } from "../game-rolls/game-rolls.model";
import { DragonGame } from "../dragon-games/dragon-games.model";

@Module({
  imports: [
    SequelizeModule.forFeature([
      User,
      Role,
      UserRoles,
      UserSeed,
      GameSetting,
      BancrollSetting,
      Setting,
      GameRoll,
      DragonGame,
    ]),
    RolesModule,
    forwardRef(() => AuthModule),
    forwardRef(() => UsersModule),
    CacheModule.register(),
  ],
  controllers: [AdminController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
