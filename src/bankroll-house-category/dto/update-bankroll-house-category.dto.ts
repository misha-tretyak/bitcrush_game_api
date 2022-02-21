import { PartialType } from '@nestjs/swagger';
import { CreateBankrollHouseCategoryDto } from './create-bankroll-house-category.dto';

export class UpdateBankrollHouseCategoryDto extends PartialType(CreateBankrollHouseCategoryDto) {}
