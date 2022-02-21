import { PartialType } from '@nestjs/swagger';
import { CreateUserWithdrawDto } from './create-user-withdraw.dto';

export class UpdateUserWithdrawDto extends PartialType(CreateUserWithdrawDto) {}
