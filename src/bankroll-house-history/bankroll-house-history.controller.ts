import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankrollHouseHistoryService } from './bankroll-house-history.service';
import { CreateBankrollHouseHistoryDto } from './dto/create-bankroll-house-history.dto';
import { UpdateBankrollHouseHistoryDto } from './dto/update-bankroll-house-history.dto';

@Controller('bankroll-house-history')
export class BankrollHouseHistoryController {
    constructor(private readonly bankrollHouseHistoryService: BankrollHouseHistoryService) { }

    @Post()
    create(@Body() createBankrollHouseHistoryDto: CreateBankrollHouseHistoryDto) {
        return this.bankrollHouseHistoryService.create(createBankrollHouseHistoryDto);
    }

    @Get()
    findAll() {
        return this.bankrollHouseHistoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankrollHouseHistoryService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBankrollHouseHistoryDto: UpdateBankrollHouseHistoryDto) {
        return this.bankrollHouseHistoryService.update(id, updateBankrollHouseHistoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankrollHouseHistoryService.remove(id);
    }
}
