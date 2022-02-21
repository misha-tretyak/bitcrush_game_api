import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserBonusesService } from './user-bonuses.service';
import { CreateUserBonusDto } from './dto/create-user-bonus.dto';
import { UpdateUserBonusDto } from './dto/update-user-bonus.dto';
import { UserBonus } from './user-bonuses.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerifyGuard } from 'src/auth/email-verify.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('User Bonuses')
@Controller('user-bonuses')
export class UserBonusesController {
  constructor(private readonly userBonusesService: UserBonusesService) { }

  @ApiOperation({ summary: 'Create User Bonus' })
  @ApiResponse({ status: 200, type: UserBonus })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createUserBonusDto: CreateUserBonusDto) {
    return this.userBonusesService.create(createUserBonusDto);
  }

  @ApiOperation({ summary: 'Get all user bonuses' })
  @ApiResponse({ status: 200, type: [UserBonus] })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.userBonusesService.findAll();
  }

  @ApiOperation({ summary: 'Get one user bonus by id' })
  @ApiResponse({ status: 200, type: UserBonus })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userBonusesService.findOne(id);
  }

  @ApiOperation({ summary: 'Update one user bonus by id' })
  @ApiResponse({ status: 200, type: UserBonus })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserBonusDto: UpdateUserBonusDto) {
    return this.userBonusesService.update(id, updateUserBonusDto);
  }

  @ApiOperation({ summary: 'Delete one user bonus by id' })
  @ApiResponse({ status: 200, type: UserBonus })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userBonusesService.remove(id);
  }
}
