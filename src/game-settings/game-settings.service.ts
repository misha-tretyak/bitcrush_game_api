import { forwardRef, Inject, Injectable, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateGameSettingDto } from "./dto/create-game-setting.dto";
import { UpdateGameSettingDto } from "./dto/update-game-setting.dto";
import { GameSetting } from "./game-settings.model";
import { BancrollSetting } from "../bancroll-settings/bancroll-settings.model";
import { UpdateGameSettingProfitLossDto } from "./dto/update-game-setting-profit-loss.dto";
import { UpdateGameSettingGeneralDto } from "./dto/update-game-setting-general.dto";
import { GameRollsService } from "../game-rolls/game-rolls.service";

@Injectable()
export class GameSettingsService {
  constructor(
    @InjectModel(GameSetting)
    private readonly gameSettingRepository: typeof GameSetting,
    @InjectModel(BancrollSetting)
    private readonly bankrollSettingRepository: typeof BancrollSetting,
    @Inject(forwardRef(() => GameRollsService))
    private readonly gameRollService: GameRollsService
  ) {}

  private logger: Logger = new Logger("GameSettingsService");

  create(createGameSettingDto: CreateGameSettingDto) {
    return this.gameSettingRepository.create(createGameSettingDto);
  }

  findAll() {
    return this.gameSettingRepository.findAll();
  }

  findOneById(id: string) {
    return this.gameSettingRepository.findOne({ where: { id } });
  }

  findOneByKey(key: string) {
    return this.gameSettingRepository.findOne({ where: { key } });
  }

  update(key: string, updateGameSettingDto: UpdateGameSettingDto) {
    return this.gameSettingRepository.update(updateGameSettingDto, {
      where: { key },
    });
  }

  remove(id: string) {
    return this.gameSettingRepository.destroy({ where: { id } });
  }

  async getDiceInvaderGeneralSettings() {
    try {
      const bankrollSettings = await this.bankrollSettingRepository.findAll({
        where: { key: ["max_win_ptc", "max_bet_ptc"] },
        attributes: ["key", "value"],
      });
      const gameSettings = await this.gameSettingRepository.findAll({
        where: {
          key: [
            "min_bet",
            "house_edge",
            "side_bet_chance",
            "side_bet_multiplier",
            "main_bet_increase_pct",
            "main_bet_decrease_pct",
            "type_increase_pct",
            "type_decrease_pct",
            "color_increase_pct",
            "color_decrease_pct",
          ],
        },
        attributes: ["key", "value"],
      });
      return [...bankrollSettings, ...gameSettings];
    } catch (err) {
      this.logger.debug(err, "Get Dice Game Settings General Error");
    }
  }

  async updateDiceInvaderGeneral(settings: UpdateGameSettingDto[]) {
    try {
      for (let i = 0; i < settings.length; i++) {
        if (
          settings[i].key === "max_win_ptc" ||
          settings[i].key === "max_bet_ptc"
        ) {
          await this.bankrollSettingRepository.update(settings[i], {
            where: { key: settings[i].key },
          });
        } else {
          await this.gameSettingRepository.update(settings[i], {
            where: { key: settings[i].key },
          });
        }
      }
      return this.getDiceInvaderGeneralSettings();
    } catch (err) {
      this.logger.debug(err, "Update Game Dice General Settings Error");
    }
  }

  getDiceInvaderProfitLossSettings() {
    try {
      return this.gameSettingRepository.findAll({
        where: {
          key: [
            "sync_balance_sec",
            "sync_balance_increase_ptc",
            "sync_balance_decrease_ptc",
            "block_user_interval",
            "unblock_user_interval",
            "block_users_time",
          ],
        },
        attributes: ["key", "value"],
      });
    } catch (err) {
      this.logger.debug(err, "Get Dice Profit Loss Settings Error");
    }
  }

  async updateDiceInvaderProfitLossSettings(settings: UpdateGameSettingDto[]) {
    try {
      for (let i = 0; i < settings.length; i++) {
        if (settings[i].key === "block_users_time") {
          await this.gameRollService.updateBlockUsersTime(
            Number(settings[i].value)
          );
        }
        await this.gameSettingRepository.update(settings[i], {
          where: { key: settings[i].key },
        });
      }
      return this.getDiceInvaderProfitLossSettings();
    } catch (err) {
      this.logger.debug(err, "Update Game Dice Profit Loss Settings Error");
    }
  }

  getAutoRollSettings() {
    try {
      return this.gameSettingRepository.findAll({
        where: {
          key: [
            "main_bet_increase_pct",
            "main_bet_decrease_pct",
            "type_increase_pct",
            "type_decrease_pct",
            "color_increase_pct",
            "color_decrease_pct",
          ],
        },
        attributes: ["key", "value"],
      });
    } catch (err) {
      this.logger.debug(err, "Get Game Dice Autoroll Settings Error");
    }
  }

  prepareSettingsFromObject(
    settingsObject: UpdateGameSettingProfitLossDto | UpdateGameSettingGeneralDto
  ): { key: string; value: string }[] {
    try {
      const setKeys: string[] = Object.keys(settingsObject);
      const setValues: string[] = Object.values(settingsObject);
      const result: { key: string; value: string }[] = [];
      setKeys.map((el, i) => {
        result.push({ key: el, value: setValues[i] });
      });
      return result;
    } catch (err) {
      this.logger.debug(err, "Prepare Settings From Object Error");
    }
  }
}
