import { Column, DataType, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface TempProfitCreationAttrs {
  wallet: string;
  profit: number;
}

@Table({ tableName: "temp_profit", timestamps: false })
export class TempProfit extends Model<TempProfit, TempProfitCreationAttrs> {
  @ApiProperty({ example: 1, description: "ID" })
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: number;

  @ApiProperty({
    example: "0xdjsadknf03223sSetc",
    description: "Wallet Address",
  })
  @Column({ type: DataType.STRING, allowNull: false })
  wallet: string;

  @ApiProperty({
    example: 22.321,
    description: "Temp Profit",
  })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  profit: number;
}
