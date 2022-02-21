import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
} from "@nestjs/common";
import { GameSettingsService } from "./game-settings.service";
import { CreateGameSettingDto } from "./dto/create-game-setting.dto";
import { UpdateGameSettingDto } from "./dto/update-game-setting.dto";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from "@nestjs/swagger";
import { EmailVerifyGuard } from "src/auth/email-verify.guard";
import { Roles } from "src/auth/roles-auth.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { GameSetting } from "./game-settings.model";
import { Request } from "express";
import { UpdateGameSettingGeneralDto } from "./dto/update-game-setting-general.dto";
import { UpdateGameSettingProfitLossDto } from "./dto/update-game-setting-profit-loss.dto";

@ApiTags("Game Settings")
@Controller("game-settings")
export class GameSettingsController {
  constructor(private readonly gameSettingsService: GameSettingsService) {}

  @ApiOperation({ summary: "Create Game setting" })
  @ApiResponse({ status: 200, type: GameSetting })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Post()
  create(@Body() createGameSettingDto: CreateGameSettingDto) {
    return this.gameSettingsService.create(createGameSettingDto);
  }

  @ApiOperation({ summary: "Get all settings" })
  @ApiResponse({ status: 200, type: [GameSetting] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get()
  findAll() {
    return this.gameSettingsService.findAll();
  }
  @ApiOperation({ summary: "Get autoroll settings" })
  @ApiResponse({ status: 200 })
  // @ApiBearerAuth("JWT")
  // @Roles("ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Get("/autoroll")
  getAutoRollSettings() {
    return this.gameSettingsService.getAutoRollSettings();
  }

  @ApiOperation({ summary: "Get one setting by id" })
  @ApiResponse({ status: 200, type: GameSetting })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get(":id")
  findOneById(@Param("id") id: string) {
    return this.gameSettingsService.findOneById(id);
  }

  @ApiOperation({ summary: "Get one setting by id" })
  @ApiResponse({ status: 200, type: GameSetting })
  // @ApiBearerAuth('JWT')
  // @Roles("ADMIN")
  // @UseGuards(EmailVerifyGuard)
  // @UseGuards(RolesGuard)
  @Get("/key/:key")
  findOneByKey(@Req() req: Request) {
    return this.gameSettingsService.findOneByKey(req.params.key);
  }

  @ApiOperation({ summary: "Update setting by id" })
  @ApiResponse({ status: 200, type: GameSetting })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch("/key/:key")
  update(
    @Req() req: Request,
    @Body() updateGameSettingDto: UpdateGameSettingDto
  ) {
    return this.gameSettingsService.update(
      req.params.key,
      updateGameSettingDto
    );
  }

  @ApiOperation({ summary: "Update Dice Invader General Settings" })
  @ApiResponse({ status: 200, type: [GameSetting] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch("/dice-invader/general")
  updateDiceIvaderGeneralSettings(
    @Body() settings: UpdateGameSettingGeneralDto
  ) {
    const result = this.gameSettingsService.prepareSettingsFromObject(settings);
    return this.gameSettingsService.updateDiceInvaderGeneral(result);
  }

  @ApiOperation({ summary: "Update Dice Invader Profit Loss Settings" })
  @ApiResponse({ status: 200, type: [GameSetting] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Patch("/dice-invader/profit-loss")
  updateProfitLossSettings(@Body() settings: UpdateGameSettingProfitLossDto) {
    const result = this.gameSettingsService.prepareSettingsFromObject(settings);
    return this.gameSettingsService.updateDiceInvaderProfitLossSettings(result);
  }

  @ApiOperation({ summary: "Get Dice Invader Profit Loss Settings" })
  @ApiResponse({ status: 200, type: [GameSetting] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/dice-invader/profit-loss")
  getDiceIvaderProfitLossSettings() {
    return this.gameSettingsService.getDiceInvaderProfitLossSettings();
  }

  @ApiOperation({ summary: "Get Dice Invader General Settings" })
  @ApiResponse({ status: 200, type: [GameSetting] })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Get("/dice-invader/general")
  getDiceIvaderGeneralSettings() {
    return this.gameSettingsService.getDiceInvaderGeneralSettings();
  }

  @ApiOperation({ summary: "Remove setting by id" })
  @ApiResponse({ status: 200, type: GameSetting })
  @ApiBearerAuth("JWT")
  @Roles("ADMIN")
  @UseGuards(EmailVerifyGuard)
  @UseGuards(RolesGuard)
  @Delete(":id")
  remove(@Param("id") id: string) {
    return this.gameSettingsService.remove(id);
  }
}
