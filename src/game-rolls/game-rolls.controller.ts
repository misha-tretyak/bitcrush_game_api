import {
  Controller,
  Get,
  Post,
  Body,
  UseGuards,
  Req,
  Query,
} from "@nestjs/common";
import { GameRollsService } from "./game-rolls.service";
import { GameRoll } from "./game-rolls.model";
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from "@nestjs/swagger";
import { Roles } from "src/auth/roles-auth.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { Request } from "express";
import { CreateRollDto } from "./dto/create-roll.dto";
import { GetLeaderboardDto } from "./dto/get-leagerboard.dto";
import { GetHistoryBetsDto } from "./dto/get-history-bets.dto";
import { GetBetsDto } from "./dto/get-bets.dto";
import { ILeaderboards, IStats, IPaginateStats } from "src/interfaces";

@ApiTags("Game Rools")
@Controller("game-rolls")
export class GameRollsController {
  constructor(private readonly gameRollsService: GameRollsService) {}

  @ApiOperation({ summary: "Leaderboard Roll Game" })
  @ApiResponse({ status: 200, type: [GetLeaderboardDto] })
  // @ApiBearerAuth('JWT')
  @Get("/leaderboard")

  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // @Roles("MISHA")
  leaderboard(): Promise<ILeaderboards[]> {
    return this.gameRollsService.leaderboard();
  }

  @ApiOperation({ summary: "Statistics Roll Game" })
  @ApiResponse({ status: 200 })
  @ApiParam({ name: "id", required: true, description: "user_id" })
  // @ApiBearerAuth('JWT')
  @Get("/statistics/:id")

  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // @Roles("MISHA")
  statistics(@Req() req: Request): Promise<IStats> {
    return this.gameRollsService.statistics(req.params.id);
  }

  @ApiOperation({ summary: "Statistics graph Roll Game" })
  @ApiResponse({ status: 200 })
  @ApiParam({ name: "id", required: true, description: "user_id" })
  // @ApiBearerAuth('JWT')
  @Get("/stats")

  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // @Roles("MISHA")
  stats(
    @Query() query: { offset: string; user_id: string; limit: string }
  ): Promise<IPaginateStats> {
    return this.gameRollsService.stats(query);
  }

  @ApiOperation({ summary: "My History Roll Game" })
  @ApiResponse({ status: 200, type: [GetHistoryBetsDto] })
  @ApiParam({ name: "id", required: true, description: "user_id" })
  // @ApiBearerAuth('JWT')
  @Roles()
  // @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/history")
  myBetsHistory(
    @Query() query: { offset: string; user_id: string; limit: string }
  ): Promise<IPaginateStats> {
    return this.gameRollsService.myBetsHistory(query);
  }

  @ApiOperation({ summary: "Last Bets Roll Game" })
  @ApiResponse({ status: 200, type: [GetBetsDto] })
  // @ApiBearerAuth('JWT')
  // @Roles("USER")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Get("/bets")
  lastBets(
    @Query() query: { offset: string; limit: string }
  ): Promise<IPaginateStats> {
    return this.gameRollsService.lastBets(query);
  }

  @ApiOperation({ summary: "Roll Game" })
  @ApiResponse({ status: 200, type: GameRoll })
  // @ApiBearerAuth('JWT')
  // @Roles("USER")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Post("/roll")
  roll(@Body() body: CreateRollDto, @Req() request: Request) {
    return this.gameRollsService.roll(body);
  }

  // @ApiOperation({ summary: 'Get all Game Rools' })
  // @ApiResponse({ status: 200, type: GameRoll })
  // @Get()
  // @ApiBearerAuth('JWT')
  // @Roles("USER", "ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // findAll() {
  //     return this.gameRollsService.findAll();
  // }

  @ApiOperation({ summary: "Get one Game Rool by id" })
  @ApiResponse({ status: 200, type: GameRoll })
  // @ApiBearerAuth('JWT')
  @Get(":id")
  // @Roles("USER", "ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  findOne(@Req() req: Request) {
    return this.gameRollsService.findOne(req.params.id);
  }

  @ApiOperation({ summary: "Get one Game Rool by id" })
  @ApiResponse({ status: 200, type: GameRoll })
  // @ApiBearerAuth('JWT')
  @Get("/seed/:id")
  // @Roles("USER", "ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  findOneWithFullSeed(@Req() req: Request) {
    return this.gameRollsService.findOneWithFullSeed(req.params.id);
  }

  // @ApiOperation({ summary: 'Update one Game Rool by id' })
  // @ApiResponse({ status: 200, type: GameRoll })
  // @ApiBearerAuth('JWT')
  // @Patch(':id')
  // @Roles("USER", "ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // update(@Param('id') id: string, @Body() updateGameRollDto: UpdateGameRollDto) {
  //     return this.gameRollsService.update(id, updateGameRollDto);
  // }

  // @ApiOperation({ summary: 'Delete one Game Rool by id' })
  // @ApiResponse({ status: 200, type: GameRoll })
  // @ApiBearerAuth('JWT')
  // @Delete(':id')
  // @Roles("ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  // remove(@Param('id') id: string) {
  //     return this.gameRollsService.remove(id);
  // }
}
