import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateUserWithdrawDto {
    @ApiProperty({ example: 'sign_bonus', description: 'CC Amount' })
    @IsNumber()
    cc_amount: number;

    @ApiProperty({ example: 3242.3, description: 'Payment amount' })
    @IsNumber()
    payment_amount: number;

    @ApiProperty({ example: 'BTC', description: 'Payment currency' })
    @IsString({ message: 'Must be a string' })
    payment_currency: string;

    @ApiProperty({ example: 'esdk3kjkj3rrc', description: 'Payment address' })
    @IsString({ message: 'Must be a string' })
    payment_address: string;

    @ApiProperty({ example: '22rfdsgfbgtes2', description: 'Transaction id' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    transaction_id?: string;

    @ApiProperty({ example: 'this is comment', description: 'Comment for withdraws' })
    @IsOptional()
    @IsString({ message: 'Must be a string' })
    comment?: string;

    @ApiProperty({ example: 1, description: 'Status deposit' })
    @IsNumber()
    status: number;

    @ApiProperty({ example: 2, description: 'Confirms' })
    @IsNumber()
    confirms: number;

    @ApiProperty({ example: true, description: 'Need Confirms' })
    @IsBoolean()
    need_confirm: boolean;

    @ApiProperty({ example: 'safdvaefsavdsvfsa', description: 'User id for deposit' })
    @IsString({ message: 'Must be a string' })
    user_id: string;
}
