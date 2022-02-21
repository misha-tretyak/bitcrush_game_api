import { forwardRef, Module } from '@nestjs/common';
import { UserSeedsService } from './user-seeds.service';
import { UserSeedsController } from './user-seeds.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from 'src/users/users.model';
import { UserSeed } from './user-seeds.model';
import { UsersModule } from 'src/users/users.module';
import { GameRollsModule } from '../game-rolls/game-rolls.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, UserRoles, UserSeed]),
        RolesModule,
        forwardRef(() => UsersModule),
        forwardRef(() => AuthModule),
    ],
    exports: [
        UserSeedsService
    ],
    controllers: [UserSeedsController],
    providers: [UserSeedsService]
})
export class UserSeedsModule { }
