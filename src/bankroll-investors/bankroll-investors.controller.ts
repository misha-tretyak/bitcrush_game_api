import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BankrollInvestorsService } from './bankroll-investors.service';
import { CreateBankrollInvestorDto } from './dto/create-bankroll-investor.dto';
import { UpdateBankrollInvestorDto } from './dto/update-bankroll-investor.dto';

@Controller('bankroll-investors')
export class BankrollInvestorsController {
    constructor(private readonly bankrollInvestorsService: BankrollInvestorsService) { }

    @Post()
    create(@Body() createBankrollInvestorDto: CreateBankrollInvestorDto) {
        return this.bankrollInvestorsService.create(createBankrollInvestorDto);
    }

    @Get()
    findAll() {
        return this.bankrollInvestorsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bankrollInvestorsService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBankrollInvestorDto: UpdateBankrollInvestorDto) {
        return this.bankrollInvestorsService.update(id, updateBankrollInvestorDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bankrollInvestorsService.remove(id);
    }
}
