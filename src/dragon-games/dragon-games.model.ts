import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { CreateDragonGameDto } from "./dto/create-dragon-game.dto";

@Table({ tableName: "dragon_games" })
export class DragonGame extends Model<DragonGame, CreateDragonGameDto> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: string;

  @ApiProperty({ example: 33, description: "DragonGame game id" })
  @Column({ type: DataType.BIGINT, allowNull: false })
  game_id: number;

  @ApiProperty({ example: 22.3, description: "Profit" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  profit: number;

  @ApiProperty({
    example: "0x30dd835c097f76b811315476ce06AbBBaB7C0182",
    description: "User Wallet Address",
  })
  @Column({ type: DataType.STRING, allowNull: false })
  wallet_address: string;
}
