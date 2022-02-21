import { forwardRef, Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { JwtModule } from "@nestjs/jwt";
import { UserSeedsModule } from "src/user-seeds/user-seeds.module";
import { TempProfitModule } from "../temp-profit/temp-profit.module";
import { SequelizeModule } from "@nestjs/sequelize";
import { TempProfit } from "../temp-profit/temp-profit.model";

@Module({
  controllers: [AuthController],
  providers: [AuthService],
  imports: [
    SequelizeModule.forFeature([TempProfit]),
    forwardRef(() => UsersModule),
    UserSeedsModule,
    TempProfitModule,
    JwtModule.register({
      secret: process.env.JWT_ACCESS_SECRET || "JwT_SeCREt_KEy",
      signOptions: {
        expiresIn: "24h",
      },
    }),
  ],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
