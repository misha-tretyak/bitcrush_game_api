import { Injectable } from '@nestjs/common';
import { BancrollInvestorHistory } from './bancroll-investor-history.model';
import { CreateBancrollInvestorHistoryDto } from './dto/create-bancroll-investor-history.dto';
import { UpdateBancrollInvestorHistoryDto } from './dto/update-bancroll-investor-history.dto';
import { InjectModel } from '@nestjs/sequelize';
import sequelize, { FindOptions } from 'sequelize';

const TYPE_INVEST = 1;
const TYPE_WITHDRAWAL = 2;
const BALANCE_SCALE = 4;

@Injectable()
export class BancrollInvestorHistoryService {
    constructor(
        @InjectModel(BancrollInvestorHistory) private readonly bancrollInvestorHistoryrepository: typeof BancrollInvestorHistory,
    ) { }

    create(createBancrollInvestorHistoryDto: CreateBancrollInvestorHistoryDto) {
        return this.bancrollInvestorHistoryrepository.create(createBancrollInvestorHistoryDto);
    }

    findAll() {
        return this.bancrollInvestorHistoryrepository.findAll();
    }

    findOne(id: string) {
        return this.bancrollInvestorHistoryrepository.findByPk(id);
    }

    update(id: string, updateBancrollInvestorHistoryDto: UpdateBancrollInvestorHistoryDto) {
        return this.bancrollInvestorHistoryrepository.update(updateBancrollInvestorHistoryDto, { where: { id } });
    }

    remove(id: string) {
        return this.bancrollInvestorHistoryrepository.destroy({ where: { id } });
    }

    findByInvestorAndDate(id: string, date: Date) {
        return this.bancrollInvestorHistoryrepository.findAll({ where: { investor_id: id, createdAt: { gt: date } } });
    }

    public async getTotalInvestorsInvestmentsAmount(dateTo: Date = null, includeToDate: boolean = true) {
        let build: FindOptions<BancrollInvestorHistory> = {};

        build.where = { type: TYPE_INVEST };
        build.attributes = [[sequelize.fn('SUM', (sequelize.col('amount'))), 'amount']];

        if (dateTo) {
            if (includeToDate) {
                // build = await this.bancrollInvestorHistoryrepository.findAll({
                //     where: { type: TYPE_INVEST, createdAt: { lte: dateTo } },
                //     attributes: [[sequelize.fn('SUM', (sequelize.col('amount'))), 'amount']]
                // });
                build.where = { createdAt: { lte: dateTo } };
            } else {
                // build = await this.bancrollInvestorHistoryrepository.findAll({
                //     where: { type: TYPE_INVEST, createdAt: { lt: dateTo } },
                //     attributes: [[sequelize.fn('SUM', (sequelize.col('amount'))), 'amount']]
                // });

                build.where = { createdAt: { lt: dateTo } }
            }
        }

        const res = await this.bancrollInvestorHistoryrepository.findAll(build);

        const amount = Number(res[0].amount ? res[0].amount.toFixed(BALANCE_SCALE) : null);

        return amount;
    }

    public async getTotalDilutionFeeAmount(dateFrom: Date = null, dateTo: Date = null, includeToDate: boolean = true) {
        let build: FindOptions<BancrollInvestorHistory> = {};

        build.where = { type: TYPE_INVEST };
        build.attributes = [[sequelize.fn('SUM', (sequelize.col('dilution_fee'))), 'dilution_fee']];

        if (dateFrom) {
            build.where = { createdAt: { gt: dateFrom } };
        }

        if (dateTo) {
            const dateToCondition = includeToDate ? { lte: dateTo } : { lt: dateTo };

            build.where = { createdAt: dateToCondition };
        }

        const amount = await this.bancrollInvestorHistoryrepository.findAll(build);

        return Number(amount[0].dilution_fee ? amount[0].dilution_fee.toFixed(BALANCE_SCALE) : null);
    }

    public async getTotalInvestorsWithdrawalsAmount(dateTo: Date = null, includeToDate: boolean = true) {
        let build: FindOptions<BancrollInvestorHistory> = {};
        build.where = { type: TYPE_WITHDRAWAL };
        build.attributes = [[sequelize.fn('SUM', (sequelize.col('amount'))), 'amount']];
        if (dateTo) {
            const dateToCondition = includeToDate ? { lte: dateTo } : { lt: dateTo };

            build.where = { createdAt: dateToCondition };
        }

        const amount = await this.bancrollInvestorHistoryrepository.findAll(build);

        return Number(amount[0].amount ? amount[0].amount.toFixed(BALANCE_SCALE) : null);
    }
}
