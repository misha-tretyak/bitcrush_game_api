import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { BancrollSettingsService } from './bancroll-settings.service';
import { CreateBancrollSettingDto } from './dto/create-bancroll-setting.dto';
import { UpdateBancrollSettingDto } from './dto/update-bancroll-setting.dto';

@ApiTags('Bancroll Settings')
@Controller('bancroll-settings')
export class BancrollSettingsController {
    constructor(private readonly bancrollSettingsService: BancrollSettingsService) { }

    @Post()
    create(@Body() createBancrollSettingDto: CreateBancrollSettingDto) {
        return this.bancrollSettingsService.create(createBancrollSettingDto);
    }

    @Get()
    findAll() {
        return this.bancrollSettingsService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.bancrollSettingsService.findOne(+id);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() updateBancrollSettingDto: UpdateBancrollSettingDto) {
        return this.bancrollSettingsService.update(+id, updateBancrollSettingDto);
    }

    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.bancrollSettingsService.remove(+id);
    }
}
