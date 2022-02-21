import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString } from "class-validator";

export class AddRoleDto {
    @ApiProperty({ example: 'USER', description: 'Name of role' })
    @IsString({ message: "Must be a string" })
    readonly value: string;

    @ApiProperty({ example: 'saffgsfgdz', description: 'User id' })
    @IsNumber({}, { message: "Must be a number" })
    readonly userId: string;
}
