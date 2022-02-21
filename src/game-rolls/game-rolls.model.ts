import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Index,
  Model,
  Table,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.model";
import { UserSeed } from "../user-seeds/user-seeds.model";

interface GameRollCreationAttrs {
  bet_number: number;
  bet: number;
  selected_range: string;
  is_winner: boolean;
  is_auto: boolean;
  roll_result: number;
  invader_color_result: number;
  roll_hash: string;
  profit_main: number;
  profit: number;
  color_bet?: number;
  type_bet?: number;
  invader_color?: number;
  invader_type?: number;
  profit_color?: number;
  profit_type?: number;
  house_part_profit?: number;
  investors_part_profit?: number;
  potential_profit: string;
  payout: number;
  user_id: string;
  user_seed_id: string;
}

@Table({ tableName: "game_rolls" })
export class GameRoll extends Model<GameRoll, GameRollCreationAttrs> {
  @Column({
    type: DataType.INTEGER,
    unique: true,
    primaryKey: true,
    autoIncrement: true,
  })
  id: string;

  @ApiProperty({ example: 33, description: "Bet number" })
  @Column({ type: DataType.BIGINT, allowNull: false })
  bet_number: number;

  @ApiProperty({ example: 3, description: "Bet" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  bet: number;

  @ApiProperty({ example: 3.2, description: "Color bet" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  color_bet: number;

  @ApiProperty({ example: 2.3, description: "Type bet" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  type_bet: number;

  @ApiProperty({ example: 3, description: "Invader color" })
  @Column({ type: DataType.INTEGER, allowNull: true })
  invader_color: number;

  @ApiProperty({ example: 2, description: "Invader type" })
  @Column({ type: DataType.INTEGER, allowNull: true })
  invader_type: number;

  @ApiProperty({ example: "22.11 - 45.76", description: "Range bet" })
  @Column({ type: DataType.STRING, allowNull: false })
  selected_range: string;

  @ApiProperty({ example: true, description: "Is Winner" })
  @Column({ type: DataType.BOOLEAN, allowNull: false })
  is_winner: boolean;

  @ApiProperty({ example: 22.33, description: "Result of roll" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  roll_result: number;

  @ApiProperty({ example: 4, description: "Invader color result" })
  @Column({ type: DataType.INTEGER, allowNull: false })
  invader_color_result: number;

  @ApiProperty({
    example: "wefsdgrtw3qaw3rfgsrth32rf",
    description: "Roll hash",
  })
  @Column({ type: DataType.STRING, allowNull: false })
  roll_hash: string;

  @ApiProperty({ example: 0.003, description: "Profit main" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  profit_main: number;

  @ApiProperty({ example: 44.2, description: "Profit color" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  profit_color: number;

  @ApiProperty({ example: 22.3, description: "Profit type" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  profit_type: number;

  @ApiProperty({ example: 22.3, description: "Profit" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  profit: number;

  @ApiProperty({ example: 33.2, description: "House part profit" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  house_part_profit: number;

  @ApiProperty({ example: 22.3, description: "Investors part profit" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  investors_part_profit: number;

  @ApiProperty({ example: "22.3-45", description: "Potential profit" })
  @Column({ type: DataType.STRING, allowNull: false })
  potential_profit: string;

  @ApiProperty({ example: 1.98, description: "Payout" })
  @Column({ type: DataType.DOUBLE, allowNull: false })
  payout: number;

  @ApiProperty({ example: true, description: "Is auto" })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  is_auto: boolean;

  @Column({ type: DataType.DATE, defaultValue: Date.now() })
  created_at: Date;

  @ForeignKey(() => User)
  @Index({ name: "game_dice_invader_rolls_user_id_index" })
  @Column({ type: DataType.UUID })
  user_id: string;

  @BelongsTo(() => User)
  user: User;

  @ForeignKey(() => UserSeed)
  @Index({ name: "game_dice_invader_rolls_user_id_user_seed_id_index" })
  @Index({ name: "game_dice_invader_rolls_user_seed_id_foreign" })
  @Column({ type: DataType.UUID })
  user_seed_id: string;

  @BelongsTo(() => UserSeed)
  user_seed: UserSeed;
}
