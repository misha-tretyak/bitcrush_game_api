import { Module } from '@nestjs/common';
import { BankrollHouseHistoryService } from './bankroll-house-history.service';
import { BankrollHouseHistoryController } from './bankroll-house-history.controller';
import { SequelizeModule } from '@nestjs/sequelize';
import { BankrollHouseHistory } from './bankroll-house-history.model';

@Module({
    imports: [SequelizeModule.forFeature([BankrollHouseHistory])],
    controllers: [BankrollHouseHistoryController],
    providers: [BankrollHouseHistoryService],
    exports: [BankrollHouseHistoryService]
})
export class BankrollHouseHistoryModule { }
