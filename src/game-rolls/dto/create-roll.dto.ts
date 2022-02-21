import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsOptional, IsString, Length, min } from "class-validator";

export class CreateRollDto {
    @ApiProperty({ example: 'us32rfsdgsa.com', description: 'user_id' })
    @IsString()
    @Length(10)
    readonly user_id: string;

    @ApiProperty({ example: 'afdgersdfZFgweas', description: 'user_seed_id' })
    @IsString()
    @Length(10)
    readonly user_seed_id: string;

    @ApiProperty({ example: 100, description: 'main bet' })
    @IsNumber()
    readonly mainBet: number;

    @ApiProperty({ example: 0, description: 'selected color' })
    @IsNumber()
    @IsOptional()
    @IsOptional()
    readonly selectedColor: number;

    @ApiProperty({ example: 2, description: 'selected type' })
    @IsNumber()
    @IsOptional()
    readonly selectedType: number;

    @ApiProperty({ example: '22.12-44.15', description: 'selected range' })
    @IsString()
    readonly selectedRange: string;

    @ApiProperty({ example: 4, description: 'type bet' })
    @IsNumber()
    @IsOptional()
    readonly typeBet: number;

    @ApiProperty({ example: 2, description: 'color bet' })
    @IsNumber()
    @IsOptional()
    readonly colorBet: number;

    @ApiProperty({ example: true, description: 'isAuto' })
    @IsBoolean()
    readonly isAuto: boolean;
}