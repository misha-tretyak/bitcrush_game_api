import { forwardRef, Module } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { SettingsController } from './settings.controller';
import { RolesModule } from 'src/roles/roles.module';
import { SequelizeModule } from '@nestjs/sequelize';
import { AuthModule } from 'src/auth/auth.module';
import { Role } from 'src/roles/roles.model';
import { UserRoles } from 'src/roles/user-roles.model';
import { User } from 'src/users/users.model';
import { Setting } from './settings.model';
import { UsersModule } from 'src/users/users.module';

@Module({
  imports: [
    SequelizeModule.forFeature([User, Role, UserRoles, Setting]),
    RolesModule,
    UsersModule,
    forwardRef(() => AuthModule),
  ],
  exports: [
    SettingsService
  ],
  controllers: [SettingsController],
  providers: [SettingsService]
})
export class SettingsModule { }
