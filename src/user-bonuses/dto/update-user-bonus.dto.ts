import { PartialType } from '@nestjs/swagger';
import { CreateUserBonusDto } from './create-user-bonus.dto';

export class UpdateUserBonusDto extends PartialType(CreateUserBonusDto) {}
