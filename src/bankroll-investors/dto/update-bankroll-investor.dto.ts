import { PartialType } from '@nestjs/swagger';
import { CreateBankrollInvestorDto } from './create-bankroll-investor.dto';

export class UpdateBankrollInvestorDto extends PartialType(CreateBankrollInvestorDto) {}
