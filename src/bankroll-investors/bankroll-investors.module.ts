import { Module, forwardRef } from '@nestjs/common';
import { BankrollInvestorsService } from './bankroll-investors.service';
import { BankrollInvestorsController } from './bankroll-investors.controller';
import { BankrollInvestor } from './bankroll-investors.model';
import { SequelizeModule } from '@nestjs/sequelize';
import { GameRollsModule } from 'src/game-rolls/game-rolls.module';
import { BancrollInvestorHistoryModule } from 'src/bancroll-investor-history/bancroll-investor-history.module';
import { UserBonusesModule } from 'src/user-bonuses/user-bonuses.module';

@Module({
    imports: [
        SequelizeModule.forFeature([BankrollInvestor]),
        BancrollInvestorHistoryModule,
        UserBonusesModule,
        forwardRef(() => GameRollsModule)
    ],
    controllers: [BankrollInvestorsController],
    providers: [BankrollInvestorsService],
    exports: [BankrollInvestorsService]
})
export class BankrollInvestorsModule { }
