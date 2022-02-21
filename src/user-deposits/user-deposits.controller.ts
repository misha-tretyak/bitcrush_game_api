import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserDepositsService } from './user-deposits.service';
import { CreateUserDepositDto } from './dto/create-user-deposit.dto';
import { UpdateUserDepositDto } from './dto/update-user-deposit.dto';
import { UserDeposit } from './user-deposits.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerifyGuard } from 'src/auth/email-verify.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('User Deposits')
@Controller('user-deposits')
export class UserDepositsController {
  constructor(private readonly userDepositsService: UserDepositsService) { }

  @ApiOperation({ summary: 'Create User Deposit' })
  @ApiResponse({ status: 200, type: UserDeposit })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createUserDepositDto: CreateUserDepositDto) {
    return this.userDepositsService.create(createUserDepositDto);
  }

  @ApiOperation({ summary: 'Get all User Deposits' })
  @ApiResponse({ status: 200, type: [UserDeposit] })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.userDepositsService.findAll();
  }

  @ApiOperation({ summary: 'Get one User Deposit by id' })
  @ApiResponse({ status: 200, type: UserDeposit })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userDepositsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update one User Deposit by id' })
  @ApiResponse({ status: 200, type: UserDeposit })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDepositDto: UpdateUserDepositDto) {
    return this.userDepositsService.update(id, updateUserDepositDto);
  }

  @ApiOperation({ summary: 'Delete one User Deposit by id' })
  @ApiResponse({ status: 200, type: UserDeposit })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userDepositsService.remove(id);
  }
}
