import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class CreateGameRollDto {
    @ApiProperty({ example: 33, description: 'Bet number' })
    @IsNumber()
    bet_number: number;

    @ApiProperty({ example: 3, description: 'Bet' })
    @IsNumber()
    bet: number;

    @ApiProperty({ example: 3.2, description: 'Color bet' })
    @IsOptional()
    @IsNumber()
    color_bet?: number;

    @ApiProperty({ example: 2.3, description: 'Type bet' })
    @IsOptional()
    @IsNumber()
    type_bet?: number;

    @ApiProperty({ example: 3, description: 'Invader color' })
    @IsOptional()
    @IsNumber()
    invader_color?: number;

    @ApiProperty({ example: 2, description: 'Invader type' })
    @IsOptional()
    @IsNumber()
    invader_type?: number;

    @ApiProperty({ example: '22.11 - 45.76', description: 'Range bet' })
    @IsString()
    selected_range: string;

    @ApiProperty({ example: true, description: 'Is Winner' })
    @IsBoolean()
    is_winner: boolean;

    @ApiProperty({ example: 22.33, description: 'Result of roll' })
    @IsNumber()
    roll_result: number;

    @ApiProperty({ example: 4, description: 'Invader color result' })
    @IsNumber()
    invader_color_result: number;

    @ApiProperty({ example: 'wefsdgrtw3qaw3rfgsrth32rf', description: 'Roll hash' })
    @IsString()
    roll_hash: string;

    @ApiProperty({ example: 0.003, description: 'Profit main' })
    @IsNumber()
    profit_main: number;

    @ApiProperty({ example: 44.2, description: 'Profit color' })
    @IsOptional()
    @IsNumber()
    profit_color?: number;

    @ApiProperty({ example: 22.3, description: 'Profit type' })
    @IsOptional()
    @IsNumber()
    profit_type?: number;

    @ApiProperty({ example: 22.3, description: 'Profit' })
    @IsNumber()
    profit: number;

    @ApiProperty({ example: 33.2, description: 'House part profit' })
    @IsOptional()
    @IsNumber()
    house_part_profit?: number;

    @ApiProperty({ example: 22.3, description: 'Investors part profit' })
    @IsOptional()
    @IsNumber()
    investors_part_profit?: number;

    @ApiProperty({ example: '22.3-45', description: 'Potential profit' })
    @IsString()
    potential_profit: string;

    @ApiProperty({ example: 1.98, description: 'Payout' })
    @IsNumber()
    payout: number;

    @ApiProperty({ example: true, description: 'Is auto' })
    @IsBoolean()
    is_auto: boolean;

    @ApiProperty({ example: 'fssadfasf2dfaesaf', description: 'User id' })
    @IsString()
    user_id: string;
}
