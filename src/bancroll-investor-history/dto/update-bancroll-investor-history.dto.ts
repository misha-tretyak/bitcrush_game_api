import { PartialType } from '@nestjs/swagger';
import { CreateBancrollInvestorHistoryDto } from './create-bancroll-investor-history.dto';

export class UpdateBancrollInvestorHistoryDto extends PartialType(CreateBancrollInvestorHistoryDto) {}
