import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { UserWithdrawsService } from './user-withdraws.service';
import { CreateUserWithdrawDto } from './dto/create-user-withdraw.dto';
import { UpdateUserWithdrawDto } from './dto/update-user-withdraw.dto';
import { UserWithdraw } from './user-withdraws.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerifyGuard } from 'src/auth/email-verify.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';

@ApiTags('User Withdraws')
@Controller('user-withdraws')
export class UserWithdrawsController {
  constructor(private readonly userWithdrawsService: UserWithdrawsService) { }

  @ApiOperation({ summary: 'Create User Withdraw' })
  @ApiResponse({ status: 200, type: UserWithdraw })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createUserWithdrawDto: CreateUserWithdrawDto) {
    return this.userWithdrawsService.create(createUserWithdrawDto);
  }

  @ApiOperation({ summary: 'Get all User Withdraws' })
  @ApiResponse({ status: 200, type: [UserWithdraw] })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.userWithdrawsService.findAll();
  }

  @ApiOperation({ summary: 'Get one User Withdraw by id' })
  @ApiResponse({ status: 200, type: UserWithdraw })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.userWithdrawsService.findOne(id);
  }

  @ApiOperation({ summary: 'Update one User Withdraw by id' })
  @ApiResponse({ status: 200, type: UserWithdraw })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserWithdrawDto: UpdateUserWithdrawDto) {
    return this.userWithdrawsService.update(id, updateUserWithdrawDto);
  }

  @ApiOperation({ summary: 'Delete one User Withdraw by id' })
  @ApiResponse({ status: 200, type: UserWithdraw })
  @ApiBearerAuth('JWT')
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.userWithdrawsService.remove(id);
  }
}
