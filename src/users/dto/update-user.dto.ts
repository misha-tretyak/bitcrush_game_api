import { ApiProperty } from "@nestjs/swagger";
import {
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
} from "class-validator";

export class UpdateUserDto {
  @ApiProperty({ example: "user@gmail.com", description: "Email" })
  @IsString()
  @IsOptional()
  email: string;

  @ApiProperty({ example: "12345678", description: "Password" })
  @IsString()
  @IsOptional()
  password: string;

  @ApiProperty({ example: "12345678", description: "Wallet Address" })
  @IsString()
  @IsOptional()
  wallet_address: string;

  @ApiProperty({ example: "user-dog", description: "Username" })
  @IsString()
  @IsOptional()
  username: string;

  @ApiProperty({ example: "1asf234asfvsa5678", description: "Refferer id" })
  @IsString()
  @IsOptional()
  refferer_id: string;

  @ApiProperty({
    example: "12dsv345assdwda678",
    description: "Email verified link",
  })
  @IsString()
  @IsOptional()
  email_verify_link: string;

  @ApiProperty({ example: 1000, description: "User Balance" })
  @IsNumber()
  balance: number;

  @ApiProperty({ example: 0, description: "Status" })
  @IsNumber()
  @IsOptional()
  status: number;

  @ApiProperty({ example: 233, description: "Bonus referee sign up" })
  @IsNumber()
  @IsOptional()
  bonus_referee_sign_up: number;

  @ApiProperty({ example: 2333, description: "bonus_referrer_sign_up" })
  @IsNumber()
  @IsOptional()
  bonus_referrer_sign_up: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_game_loss" })
  @IsNumber()
  @IsOptional()
  bonus_referrer_game_loss: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_game_win" })
  @IsNumber()
  @IsOptional()
  bonus_referrer_game_win: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_deposit" })
  @IsNumber()
  @IsOptional()
  bonus_referrer_deposit: number;

  @ApiProperty({
    example: "12:22 - 08.11.21",
    description: "Date when user verified email",
  })
  @IsDate()
  @IsOptional()
  email_verified_at: Date;

  @ApiProperty({
    example: "12:22 - 08.11.21",
    description: "Date when user last logined",
  })
  @IsDate()
  @IsOptional()
  last_login_at: Date;

  @ApiProperty({
    example: "safjks.dn;kl/xnlhjsamnd",
    description: "Token for remember",
  })
  @IsString()
  @IsOptional()
  remember_token: string;

  @ApiProperty({
    example: "dsfgsodizlfkx",
    description: "Google 2fa auth secret key",
  })
  @IsString()
  @IsOptional()
  google2fa_secret: string;

  @ApiProperty({ example: true, description: "Enable google 2fa auth" })
  @IsBoolean()
  @IsOptional()
  google2fa_enabled: boolean;
}
