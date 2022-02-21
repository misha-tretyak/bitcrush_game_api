import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankrollHouseCategoryService } from './bankroll-house-category.service';
import { CreateBankrollHouseCategoryDto } from './dto/create-bankroll-house-category.dto';
import { UpdateBankrollHouseCategoryDto } from './dto/update-bankroll-house-category.dto';

@Controller('bankroll-house-category')
export class BankrollHouseCategoryController {
    constructor(private readonly bankrollHouseCategoryService: BankrollHouseCategoryService) { }

    @Post()
    create(@Body() createBankrollHouseCategoryDto: CreateBankrollHouseCategoryDto) {
        return this.bankrollHouseCategoryService.create(createBankrollHouseCategoryDto);
    }

    @Get()
    findAll() {
        return this.bankrollHouseCategoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankrollHouseCategoryService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBankrollHouseCategoryDto: UpdateBankrollHouseCategoryDto) {
        return this.bankrollHouseCategoryService.update(id, updateBankrollHouseCategoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankrollHouseCategoryService.remove(id);
    }
}
