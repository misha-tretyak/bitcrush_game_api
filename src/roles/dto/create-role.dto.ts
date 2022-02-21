import { ApiProperty } from "@nestjs/swagger";

export class CreateRoleDto {
    @ApiProperty({ example: 'ADMIN', description: 'Unique value for role' })
    readonly value: string;

    @ApiProperty({ example: 'Administrator in bitcrush', description: 'Description for role' })
    readonly description: string;
}
