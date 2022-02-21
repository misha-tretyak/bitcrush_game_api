import { forwardRef, Module } from '@nestjs/common';
import { UserBonusesService } from './user-bonuses.service';
import { UserBonusesController } from './user-bonuses.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from 'src/users/users.model';
import { UserBonus } from './user-bonuses.model';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, UserRoles, UserBonus]),
        RolesModule,
        // UsersModule,
        forwardRef(() => AuthModule),
        forwardRef(() => UsersModule),
    ],
    exports: [
        UserBonusesService
    ],
    controllers: [UserBonusesController],
    providers: [UserBonusesService]
})
export class UserBonusesModule { }
