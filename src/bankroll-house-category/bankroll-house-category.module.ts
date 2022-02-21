import { Module } from '@nestjs/common';
import { BankrollHouseCategoryService } from './bankroll-house-category.service';
import { BankrollHouseCategoryController } from './bankroll-house-category.controller';
import { BankrollHouseCategory } from './bankroll-house-categories.model';
import { SequelizeModule } from '@nestjs/sequelize';

@Module({
    imports: [SequelizeModule.forFeature([BankrollHouseCategory])],
    controllers: [BankrollHouseCategoryController],
    providers: [BankrollHouseCategoryService],
    exports: [BankrollHouseCategoryService]
})
export class BankrollHouseCategoryModule { }
