import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNumber, IsOptional, IsString, Length } from "class-validator";

export class CreateUserDto {

    @ApiProperty({ example: 'user@gmail.com', description: 'Email' })
    @IsString({ message: 'Must be a string' })
    @IsEmail({}, { message: "Wrong email" })
    @IsOptional()
    readonly email?: string;

    @ApiProperty({ example: '12345678', description: 'Password' })
    @IsString({ message: 'Must be a string' })
    @Length(8, 16, { message: 'Not less than 8 and not more than 16' })
    @IsOptional()
    readonly password?: string;

    @ApiProperty({ example: 'player123', description: 'Username' })
    @IsString({ message: 'Must be a string' })
    @Length(4, 16, { message: 'Not less than 4 and not more than 16' })
    @IsOptional()
    readonly username?: string;

    @ApiProperty({ example: 'W1xUSEaZpOvdfx163R2eGZBIA7BkZbrlQr9WKGXDklw13T', description: 'Wallet Address' })
    @IsString({ message: 'Must be a string' })
    @Length(4, 46, { message: 'Not less than 4 and not more than 46' })
    @IsOptional()
    readonly wallet_address: string;

    @ApiProperty({ example: 15.3500, description: 'User balance' })
    @IsNumber()
    @IsOptional()
    readonly balance?: number;


}
