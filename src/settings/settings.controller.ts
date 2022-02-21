import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { SettingsService } from './settings.service';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './settings.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerifyGuard } from 'src/auth/email-verify.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('Settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @ApiOperation({ summary: 'Create setting' })
  @ApiResponse({ status: 200, type: Setting })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createSettingDto: CreateSettingDto) {
    return this.settingsService.create(createSettingDto);
  }

  @ApiOperation({ summary: 'Get all settings' })
  @ApiResponse({ status: 200, type: [Setting] })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.settingsService.findAll();
  }

  @ApiOperation({ summary: 'Get one setting by id' })
  @ApiResponse({ status: 200, type: Setting })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.settingsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update one by id' })
  @ApiResponse({ status: 200, type: Setting })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateSettingDto: UpdateSettingDto) {
    return this.settingsService.update(id, updateSettingDto);
  }

  @ApiOperation({ summary: 'Remove one by id' })
  @ApiResponse({ status: 200, type: Setting })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.settingsService.remove(id);
  }
}
