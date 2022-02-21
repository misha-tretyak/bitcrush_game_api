import {
  Body,
  Controller,
  Get,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from "@nestjs/common";
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from "@nestjs/swagger";
import { Roles } from "../auth/roles-auth.decorator";
import { EmailVerifyGuard } from "../auth/email-verify.guard";
import { RolesGuard } from "../auth/roles.guard";
import { AdminService } from "./admin.service";
import { Request } from "express";

@ApiTags("Admin")
@Controller("admin")
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @ApiOperation({ summary: "Admin Dashboard Card Players" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/dg/profit")
  get_dragon_games_profit(
    @Body() { fromDate, toDate }: { fromDate: Date; toDate: Date }
  ) {
    return this.adminService.get_dragon_games_profit(fromDate, toDate);
  }

  @ApiOperation({ summary: "Admin Dashboard Card Players" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/cards/players")
  card_number_of_players(
    @Body() { fromDate, toDate }: { fromDate: Date; toDate: Date }
  ) {
    return this.adminService.card_number_of_players(fromDate, toDate);
  }

  @ApiOperation({ summary: "Admin Dashboard Card Bets" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/cards/bets")
  card_total_bet(
    @Body() { fromDate, toDate }: { fromDate: Date; toDate: Date }
  ) {
    return this.adminService.card_total_bet(fromDate, toDate);
  }

  @ApiOperation({ summary: "Admin Dashboard Card Bankroll" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/cards/bankroll")
  card_total_bankroll() {
    return this.adminService.card_total_bankroll();
  }

  @ApiOperation({ summary: "Admin Dashboard Card Wagered" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/cards/wagered")
  card_total_wagered(
    @Body() { fromDate, toDate }: { fromDate: Date; toDate: Date }
  ) {
    return this.adminService.card_total_wagered(fromDate, toDate);
  }

  @ApiOperation({ summary: "Admin Dashboard Card ATH NET" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/cards/ath-net")
  card_ath_net_profit(
    @Body() { fromDate, toDate }: { fromDate: Date; toDate: Date }
  ) {
    return this.adminService.card_ath_net_profit(fromDate, toDate);
  }

  @ApiOperation({ summary: "Admin Dashboard Chart Games" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/chart/games")
  chartDataGames(
    @Body()
    {
      fromDate,
      toDate,
      point,
    }: {
      fromDate: Date;
      toDate: Date;
      point: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
    }
  ) {
    return this.adminService.chartDataGames(fromDate, toDate, point);
  }

  @ApiOperation({ summary: "Admin Dashboard Chart Players" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/chart/players")
  chartDataPlayers(
    @Body()
    {
      fromDate,
      toDate,
      point,
    }: {
      fromDate: Date;
      toDate: Date;
      point: "HOUR" | "DAY" | "WEEK" | "MONTH" | "YEAR";
    }
  ) {
    return this.adminService.chartDataPlayers(fromDate, toDate, point);
  }

  @ApiOperation({ summary: "Admin Change User 2FA" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch("/user/general")
  changeGeneralUserSettings(
    @Body()
    {
      wallet_address,
      enabled_2fa,
      email,
      username,
    }: {
      wallet_address: string;
      enabled_2fa: boolean;
      email: string;
      username: string;
    }
  ) {
    return this.adminService.changeGeneralUserSettings(
      wallet_address,
      enabled_2fa,
      email,
      username
    );
  }

  @ApiOperation({ summary: "Top Ten" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post("/top-ten")
  topTen(
    @Body()
    {
      fromDate,
      toDate,
      order,
    }: {
      fromDate: Date;
      toDate: Date;
      order: "ASC" | "DESC";
    }
  ) {
    return this.adminService.topTen(fromDate, toDate, order);
  }

  @ApiOperation({ summary: "User Details" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/user/:wallet_address")
  userDetail(@Req() req: Request) {
    return this.adminService.getUserDetails(req.params.wallet_address);
  }

  @ApiOperation({ summary: "Block User" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/user/block/:wallet_address")
  blockUser(@Req() req: Request) {
    return this.adminService.blockUser(req.params.wallet_address);
  }

  @ApiOperation({ summary: "UnBlock User" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/user/unblock/:wallet_address")
  unblockUser(@Req() req: Request) {
    return this.adminService.unblockUser(req.params.wallet_address);
  }

  @ApiOperation({ summary: "Last Games" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/last-games")
  lastGames(
    @Query()
    query: {
      offset: string;
      limit: string;
      order: "ASC" | "DESC";
      column: string;
      fromDate?: Date;
      toDate?: Date;
      search?: string;
    }
  ) {
    return this.adminService.lastGames(query);
  }

  @ApiOperation({ summary: "Get All Users" })
  @ApiResponse({ status: 200 })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/users")
  getAllUsers(
    @Query()
    query: {
      offset: string;
      limit: string;
      order: "ASC" | "DESC";
      column: string;
      fromDate: Date;
      toDate: Date;
      search?: string;
    }
  ) {
    return this.adminService.getAllUsers(query);
  }
}
