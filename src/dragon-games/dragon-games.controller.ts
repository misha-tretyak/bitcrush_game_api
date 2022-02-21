import { Controller, Get, Post, Body, Req } from "@nestjs/common";
import { DragonGamesService } from "./dragon-games.service";
import { CreateDragonGameDto } from "./dto/create-dragon-game.dto";
import { Request } from "express";

@Controller("dragon-games")
export class DragonGamesController {
  constructor(private readonly dragonGamesService: DragonGamesService) {}

  @Post()
  create(@Body() createDragonGameDto: CreateDragonGameDto) {
    return this.dragonGamesService.create(createDragonGameDto);
  }

  @Get()
  findAll() {
    return this.dragonGamesService.findAll();
  }

  @Get("/wallet/:wallet")
  findByWallet(@Req() req: Request) {
    return this.dragonGamesService.findByWallet(req.params.wallet);
  }

  @Get("/game/:game_id")
  findByGameID(@Req() req: Request) {
    return this.dragonGamesService.findByGameID(Number(req.params.game_id));
  }

  @Get("/bankroll")
  getBankrollBalanceByWallet() {
    return this.dragonGamesService.getBankrollBalance();
  }
}
