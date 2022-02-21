import { Module } from "@nestjs/common";
import { TempProfitService } from "./temp-profit.service";
import { TempProfit } from "./temp-profit.model";
import { SequelizeModule } from "@nestjs/sequelize";

@Module({
  imports: [SequelizeModule.forFeature([TempProfit])],
  exports: [TempProfitService],
  providers: [TempProfitService],
})
export class TempProfitModule {}
