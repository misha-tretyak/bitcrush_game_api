import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, Length } from "class-validator";

export class CreateDragonGameDto {
  @ApiProperty({ example: 2, description: "DragonGames Game ID" })
  @IsNumber()
  game_id: number;

  @ApiProperty({ example: 3.44, description: "Profit" })
  @IsNumber()
  profit: number;

  @ApiProperty({
    example: "0x30dd835c097f76b811315476ce06AbBBaB7C0182",
    description: "User wallet address",
  })
  @IsString({ message: "Must be a string" })
  @Length(4, 46, { message: "Not less than 4 and not more than 46" })
  wallet_address: string;
}
