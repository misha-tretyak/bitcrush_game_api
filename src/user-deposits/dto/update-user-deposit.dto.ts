import { PartialType } from '@nestjs/swagger';
import { CreateUserDepositDto } from './create-user-deposit.dto';

export class UpdateUserDepositDto extends PartialType(CreateUserDepositDto) {}
