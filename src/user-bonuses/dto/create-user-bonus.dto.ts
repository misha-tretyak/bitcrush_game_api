import { ApiProperty } from "@nestjs/swagger";
import { IsString } from "class-validator";

export class CreateUserBonusDto {
    @ApiProperty({ example: 'sign_bonus', description: 'Type for bonus' })
    @IsString({ message: 'Must be a string' })
    readonly type: string;

    @ApiProperty({ example: '1000', description: 'Amount for bonus' })
    @IsString({ message: 'Must be a string' })
    readonly amount: string;

    @ApiProperty({ example: 'sdfsfdvsdadw33qweafc', description: 'User id for bonus' })
    @IsString({ message: 'Must be a string' })
    readonly user_id: string;
}
