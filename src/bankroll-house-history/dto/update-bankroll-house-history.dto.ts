import { PartialType } from '@nestjs/swagger';
import { CreateBankrollHouseHistoryDto } from './create-bankroll-house-history.dto';

export class UpdateBankrollHouseHistoryDto extends PartialType(CreateBankrollHouseHistoryDto) {}
