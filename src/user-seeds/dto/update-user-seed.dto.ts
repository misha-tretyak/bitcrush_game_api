import { ApiProperty, PartialType } from '@nestjs/swagger';
import { IsString } from 'class-validator';
import { CreateUserSeedDto } from './create-user-seed.dto';

export class UpdateUserSeedDto extends PartialType(CreateUserSeedDto) {
    @ApiProperty({ example: 'aadsfsd7878s', description: 'user seed id' })
    @IsString()
    readonly id: string;
}
