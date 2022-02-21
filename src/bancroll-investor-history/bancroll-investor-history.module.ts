import { Module } from '@nestjs/common';
import { BancrollInvestorHistoryService } from './bancroll-investor-history.service';
import { BancrollInvestorHistoryController } from './bancroll-investor-history.controller';
import { BancrollInvestorHistory } from './bancroll-investor-history.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    imports: [SequelizeModule.forFeature([BancrollInvestorHistory])],
    controllers: [BancrollInvestorHistoryController],
    providers: [BancrollInvestorHistoryService],
    exports: [BancrollInvestorHistoryService]
})
export class BancrollInvestorHistoryModule { }
