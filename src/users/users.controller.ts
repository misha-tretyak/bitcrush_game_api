import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  UseGuards,
  Patch,
} from "@nestjs/common";
import { CreateUserDto } from "./dto/create-user.dto";
import { UsersService } from "./users.service";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { User } from "./users.model";
import { Roles } from "../auth/roles-auth.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { EmailVerifyGuard } from "src/auth/email-verify.guard";
import { AddRoleDto } from "./dto/add-role.dto";
import { AuthService } from "../auth/auth.service";
import { UpdateUserDto } from "./dto/update-user.dto";
import { Request } from "express";

@ApiTags("Users")
@Controller("users")
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService
  ) {}

  @ApiOperation({ summary: "Create User" })
  @ApiResponse({ status: 200, type: User })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() userDto: CreateUserDto) {
    return this.usersService.createUser(userDto);
  }

  @ApiOperation({ summary: "Get All Users" })
  @ApiResponse({ status: 200, type: [User] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  getAll() {
    return this.usersService.getAllUsers();
  }

  @ApiOperation({ summary: "Send activation mail again" })
  @ApiResponse({ status: 200, type: [User] })
  @ApiBearerAuth("JWT")
  @Roles("USER")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/send-activation-mail-again")
  sendVerifyEmailAgain(@Body() body: CreateUserDto) {
    this.authService.sendActivationMailAgain(body.email);
    return;
  }

  @ApiOperation({ summary: "Add Role to User" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/role")
  addRole(@Body() dto: AddRoleDto) {
    return this.usersService.addRole(dto);
  }

  @ApiOperation({ summary: "Update User Balance" })
  @ApiResponse({ status: 200 })
  // @ApiBearerAuth('JWT')
  // @Roles("USER")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Patch("/update/:id")
  updateBalance(
    @Body() dto: { wallet_address: string; balance: number },
    @Req() req: Request
  ) {
    return this.usersService.updateBalance(dto);
  }

  @ApiOperation({ summary: "Get User By ID" })
  @ApiResponse({ status: 200 })
  // @ApiBearerAuth('JWT')
  // @Roles("USER")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Get(":id")
  getById(@Req() req: Request) {
    return this.usersService.getUserById(req.params.id);
  }

  @ApiOperation({ summary: "Get User By ID" })
  @ApiResponse({ status: 200 })
  // @ApiBearerAuth('JWT')
  // @Roles("USER")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Get("/wallet/:wallet")
  getByWallet(@Req() req: Request) {
    return this.usersService.getUserByWalletAddressForClient(req.params.wallet);
  }

  @Get("/wallet/db/:wallet")
  getUserBalanceByWalletInDB(@Req() req: Request) {
    return this.usersService.getUserBalanceByWalletInDB(req.params.wallet);
  }

  @Get("/wallet/lw/:wallet")
  getUserBalanceByWalletInLW(@Req() req: Request) {
    return this.usersService.getUserBalanceByWalletInLW(req.params.wallet);
  }
}
