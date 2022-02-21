import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { BankrollHouseCategory } from './bankroll-house-categories.model';
import { CreateBankrollHouseCategoryDto } from './dto/create-bankroll-house-category.dto';
import { UpdateBankrollHouseCategoryDto } from './dto/update-bankroll-house-category.dto';

@Injectable()
export class BankrollHouseCategoryService {
    constructor(
        @InjectModel(BankrollHouseCategory) private readonly bankrollHouseCategoryRepository: typeof BankrollHouseCategory,
    ) { }

    create(createBankrollHouseCategoryDto: CreateBankrollHouseCategoryDto) {
        return this.bankrollHouseCategoryRepository.create(createBankrollHouseCategoryDto);
    }

    findAll() {
        return this.bankrollHouseCategoryRepository.findAll();
    }

    findOne(id: string) {
        return this.bankrollHouseCategoryRepository.findByPk(id);
    }

    update(id: string, updateBankrollHouseCategoryDto: UpdateBankrollHouseCategoryDto) {
        return this.bankrollHouseCategoryRepository.update(updateBankrollHouseCategoryDto, { where: { id } });
    }

    remove(id: string) {
        return this.bankrollHouseCategoryRepository.destroy({ where: { id } });
    }

    findByUserId(id: string) {
        return this.bankrollHouseCategoryRepository.findOne({ where: { user_id: id } });
    }
}
