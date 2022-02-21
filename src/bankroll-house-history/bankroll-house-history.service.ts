import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateBankrollHouseHistoryDto } from './dto/create-bankroll-house-history.dto';
import { UpdateBankrollHouseHistoryDto } from './dto/update-bankroll-house-history.dto';
import { BankrollHouseHistory } from './bankroll-house-history.model';

const TYPE_WITHDRAWAL = 1;
const TYPE_DEPOSIT = 2;

@Injectable()
export class BankrollHouseHistoryService {
    constructor(
        @InjectModel(BankrollHouseHistory) private readonly bankrollHouseHistoryRepository: typeof BankrollHouseHistory,
    ) { }

    create(createBankrollHouseHistoryDto: CreateBankrollHouseHistoryDto) {
        return this.bankrollHouseHistoryRepository.create(createBankrollHouseHistoryDto);
    }

    findAll() {
        return this.bankrollHouseHistoryRepository.findAll();
    }

    findOne(id: string) {
        return this.bankrollHouseHistoryRepository.findByPk(id);
    }

    update(id: string, updateBankrollHouseHistoryDto: UpdateBankrollHouseHistoryDto) {
        return this.bankrollHouseHistoryRepository.update(updateBankrollHouseHistoryDto, { where: { id } });
    }

    remove(id: string) {
        return this.bankrollHouseHistoryRepository.destroy({ where: { id } });
    }

    findByCategoryAndTypeAndDate(category_id: string, date: Date) {
        return this.bankrollHouseHistoryRepository.findAll({ where: { category_id, type: TYPE_WITHDRAWAL, createdAt: { gt: date } } });
    }
}
