import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, Length, IsOptional } from "class-validator";

export class LoginUserDto {
  @ApiProperty({ example: "12345678", description: "Password" })
  @IsString({ message: "Must be a string" })
  @Length(8, 16, { message: "Not less than 8 and not more than 16" })
  @IsOptional()
  readonly password?: string;

  @ApiProperty({ example: "player123", description: "Username" })
  @IsString({ message: "Must be a string" })
  @IsEmail()
  @Length(4, 50, { message: "Not less than 4 and not more than 50" })
  @IsOptional()
  readonly email?: string;

  @ApiProperty({
    example: "W1xUSEaZpOvdfx163R2eGZBIA7BkZbrlQr9WKGXDklw13T",
    description: "Wallet Address",
  })
  @IsString({ message: "Must be a string" })
  @Length(4, 46, { message: "Not less than 4 and not more than 46" })
  @IsOptional()
  readonly wallet_address?: string;

  @ApiProperty({
    example: "W1xUSEaZpOvdfx163R2eGZBIA7BkZbrlQr9WKGXDklw13T",
    description: "Signature",
  })
  @IsString({ message: "Must be a string" })
  @Length(10)
  @IsOptional()
  readonly signature?: string;
}
