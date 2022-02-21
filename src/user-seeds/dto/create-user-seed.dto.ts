import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsString } from "class-validator";

export class CreateUserSeedDto {
    @ApiProperty({ example: '22rfdsgfbgtes2', description: 'Server seed public' })
    @IsString({ message: 'Must be a string' })
    server_seed_public: string;

    @ApiProperty({ example: '22rfdsgfbgtes2', description: 'Server seed private' })
    @IsString({ message: 'Must be a string' })
    server_seed_private: string;

    @ApiProperty({ example: '22rfdsgfbgtes2', description: 'Client seed' })
    @IsString({ message: 'Must be a string' })
    client_seed: string;

    @ApiProperty({ example: false, description: 'Is active' })
    @IsBoolean()
    is_active: boolean;

    @ApiProperty({ example: true, description: 'Is next unused' })
    @IsBoolean()
    is_next_unused: boolean;

    @ApiProperty({ example: '22rfdsgfbgtes2', description: 'User id' })
    @IsString({ message: 'Must be a string' })
    user_id: string;
}
