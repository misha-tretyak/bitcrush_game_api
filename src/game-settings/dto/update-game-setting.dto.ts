import { PartialType } from '@nestjs/swagger';
import { CreateGameSettingDto } from './create-game-setting.dto';

export class UpdateGameSettingDto extends PartialType(CreateGameSettingDto) {}
