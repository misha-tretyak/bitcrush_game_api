import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateGameSettingDto {
    @ApiProperty({ example: 'min_bet', description: 'Key for setting' })
    @IsString({ message: 'Must be a string' })
    readonly key: string;

    @ApiProperty({ example: '1', description: 'Value for setting' })
    @IsString({ message: 'Must be a string' })
    readonly value: string;
}
