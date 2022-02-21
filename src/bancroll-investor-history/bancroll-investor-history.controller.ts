import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { BancrollInvestorHistoryService } from './bancroll-investor-history.service';
import { CreateBancrollInvestorHistoryDto } from './dto/create-bancroll-investor-history.dto';
import { UpdateBancrollInvestorHistoryDto } from './dto/update-bancroll-investor-history.dto';

@Controller('bancroll-investor-history')
export class BancrollInvestorHistoryController {
    constructor(private readonly bancrollInvestorHistoryService: BancrollInvestorHistoryService) { }

    @Post()
    create(@Body() createBancrollInvestorHistoryDto: CreateBancrollInvestorHistoryDto) {
        return this.bancrollInvestorHistoryService.create(createBancrollInvestorHistoryDto);
    }

    @Get()
    findAll() {
        return this.bancrollInvestorHistoryService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bancrollInvestorHistoryService.findOne(id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBancrollInvestorHistoryDto: UpdateBancrollInvestorHistoryDto) {
        return this.bancrollInvestorHistoryService.update(id, updateBancrollInvestorHistoryDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bancrollInvestorHistoryService.remove(id);
    }
}
