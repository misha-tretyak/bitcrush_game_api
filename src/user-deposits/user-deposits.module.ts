import { forwardRef, Module } from '@nestjs/common';
import { UserDepositsService } from './user-deposits.service';
import { UserDepositsController } from './user-deposits.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from 'src/users/users.model';
import { UserDeposit } from './user-deposits.model';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, UserRoles, UserDeposit]),
        RolesModule,
        // UsersModule,
        forwardRef(() => AuthModule),
        forwardRef(() => UsersModule),
    ],
    exports: [
        UserDepositsService
    ],
    controllers: [UserDepositsController],
    providers: [UserDepositsService]
})
export class UserDepositsModule { }
