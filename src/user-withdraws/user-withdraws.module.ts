import { forwardRef, Module } from '@nestjs/common';
import { UserWithdrawsService } from './user-withdraws.service';
import { UserWithdrawsController } from './user-withdraws.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from 'src/users/users.model';
import { UserWithdraw } from './user-withdraws.model';
import { UsersModule } from 'src/users/users.module';

@Module({
    imports: [
        SequelizeModule.forFeature([User, Role, UserRoles, UserWithdraw]),
        RolesModule,
        // UsersModule,
        forwardRef(() => AuthModule),
        forwardRef(() => UsersModule),
    ],
    exports: [
        UserWithdrawsService
    ],
    controllers: [UserWithdrawsController],
    providers: [UserWithdrawsService]
})
export class UserWithdrawsModule { }
