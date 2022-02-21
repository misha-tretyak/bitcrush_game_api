import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { UserSeedsService } from './user-seeds.service';
import { CreateUserSeedDto } from './dto/create-user-seed.dto';
import { UpdateUserSeedDto } from './dto/update-user-seed.dto';
import { UserSeed } from './user-seeds.model';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { EmailVerifyGuard } from 'src/auth/email-verify.guard';
import { Roles } from 'src/auth/roles-auth.decorator';
import { RolesGuard } from 'src/auth/roles.guard';
import { Request } from 'express';

@ApiTags('User Seeds')
@Controller('user-seeds')
export class UserSeedsController {
    constructor(private readonly userSeedsService: UserSeedsService) { }

    @ApiOperation({ summary: 'Create User Seed' })
    @ApiResponse({ status: 200, type: UserSeed })
    // @ApiBearerAuth('JWT')
    // @Roles("USER")
    // @UseGuards(EmailVerifyGuard)
    // @UseGuards(RolesGuard)
    @Post()
    create(@Body() createUserSeedDto: CreateUserSeedDto) {
        return this.userSeedsService.create(createUserSeedDto);
    }

    @ApiOperation({ summary: 'Get all User Seeds' })
    @ApiResponse({ status: 200, type: [UserSeed] })
    @ApiBearerAuth('JWT')
    @Roles("ADMIN")
    @UseGuards(EmailVerifyGuard)
    @UseGuards(RolesGuard)
    @Get()
    findAll() {
        return this.userSeedsService.findAll();
    }

    @ApiOperation({ summary: 'Get one User Seed by id' })
    @ApiResponse({ status: 200, type: UserSeed })
    // @ApiBearerAuth('JWT')
    // @Roles("ADMIN")
    // @UseGuards(EmailVerifyGuard)
    // @UseGuards(RolesGuard)
    @Get(':user_id')
    findOne(@Req() req: Request) {
        return this.userSeedsService.findOne(req.params.user_id);
    }

    @ApiOperation({ summary: 'Update one User Seed by id' })
    @ApiResponse({ status: 200, type: UserSeed })
    @ApiBearerAuth('JWT')
    @Roles("ADMIN")
    @UseGuards(EmailVerifyGuard)
    @UseGuards(RolesGuard)
    @Patch(':id')
    update(@Param('id') id: string, @Body() updateUserSeedDto: UpdateUserSeedDto) {
        return this.userSeedsService.update(id, updateUserSeedDto);
    }

    @ApiOperation({ summary: 'Delete one User Seed by id' })
    @ApiResponse({ status: 200, type: UserSeed })
    @ApiBearerAuth('JWT')
    @Roles("ADMIN")
    @UseGuards(EmailVerifyGuard)
    @UseGuards(RolesGuard)
    @Delete(':id')
    remove(@Param('id') id: string) {
        return this.userSeedsService.remove(id);
    }
}
