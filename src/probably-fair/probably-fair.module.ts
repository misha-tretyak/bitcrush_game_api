import { forwardRef, Module } from "@nestjs/common";
import { SequelizeModule } from "@nestjs/sequelize";
import { AuthModule } from "src/auth/auth.module";
import { GameRoll } from "src/game-rolls/game-rolls.model";
import { Role } from "src/roles/roles.model";
import { RolesModule } from "src/roles/roles.module";
import { UserRoles } from "src/roles/user-roles.model";
import { UserSeed } from "src/user-seeds/user-seeds.model";
import { User } from "src/users/users.model";
import { ProbablyFairController } from "./probably-fair.controller";
import { ProbablyFairService } from "./probably-fair.service";
import { GameRollsModule } from '../game-rolls/game-rolls.module';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, UserRoles, GameRoll, UserSeed]),
        RolesModule,
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
        forwardRef(() => GameRollsModule),
    ],
    exports: [ProbablyFairService],
    controllers: [ProbablyFairController],
    providers: [ProbablyFairService],
})

export class ProbablyFairModule { }