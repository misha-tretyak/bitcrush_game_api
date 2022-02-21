import { PartialType } from '@nestjs/swagger';
import { CreateGameRollDto } from './create-game-roll.dto';

export class UpdateGameRollDto extends PartialType(CreateGameRollDto) {}
