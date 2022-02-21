import { Injectable } from '@nestjs/common';
import { CreateBankrollInvestorDto } from './dto/create-bankroll-investor.dto';
import { UpdateBankrollInvestorDto } from './dto/update-bankroll-investor.dto';
import { BankrollInvestor } from './bankroll-investors.model';
import { InjectModel } from '@nestjs/sequelize';
import { GameRollsService } from '../game-rolls/game-rolls.service';
import { BancrollInvestorHistoryService } from '../bancroll-investor-history/bancroll-investor-history.service';
import { UserBonusesService } from '../user-bonuses/user-bonuses.service';

@Injectable()
export class BankrollInvestorsService {
    constructor(
        @InjectModel(BankrollInvestor) private readonly bankrollInvestorRepository: typeof BankrollInvestor,
        private readonly gameRollService: GameRollsService,
        private readonly bancrollInvestorHistoryService: BancrollInvestorHistoryService,
        private readonly userBonusesService: UserBonusesService,
    ) { }

    create(createBankrollInvestorDto: CreateBankrollInvestorDto) {
        return this.bankrollInvestorRepository.create(createBankrollInvestorDto);
    }

    findAll() {
        return this.bankrollInvestorRepository.findAll();
    }

    findOne(id: string) {
        return this.bankrollInvestorRepository.findByPk(id);
    }

    update(id: string, updateBankrollInvestorDto: UpdateBankrollInvestorDto) {
        return this.bankrollInvestorRepository.update(updateBankrollInvestorDto, { where: { id } });
    }

    remove(id: string) {
        return this.bankrollInvestorRepository.destroy({ where: { id } });
    }

    findByUserId(id: string) {
        return this.bankrollInvestorRepository.findOne({ where: { user_id: id } });
    }

    // public async getInvestorsBankrollBalance(dateTo: Date | null = null, includeDateTo: boolean = true) {
    //     const sumTotalInvestorsGamesProfit = await this.gameRollService.getTotalInvestorsGamesProfit(null, dateTo, includeDateTo);
    //     const sumInvestorInvestments = await this.bancrollInvestorHistoryService.getTotalInvestorsInvestmentsAmount(dateTo, includeDateTo);
    //     const sumInvestorInvestmentsDilutionFee = await this.bancrollInvestorHistoryService.getTotalDilutionFeeAmount(null, dateTo, includeDateTo);
    //     const sumInvestorWithdrawals = await this.bancrollInvestorHistoryService.getTotalInvestorsWithdrawalsAmount(dateTo, includeDateTo);
    //     const sumUserBonuses = await this.userBonusesService.getTotalBonusesAmount(null, dateTo, includeDateTo);

    //     const balance = sumInvestorInvestments + sumInvestorInvestmentsDilutionFee + sumTotalInvestorsGamesProfit - sumInvestorWithdrawals - sumUserBonuses;

    //     return +balance.toFixed(8);
    // }

}

