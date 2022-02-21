import {
  BelongsTo,
  Column,
  DataType,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "../users/users.model";

interface ChatCreationAttrs {
  from_user_id: string;
  to_user_id: string;
  message: string;
}

@Table({ tableName: "chat", timestamps: false })
export class Chat extends Model<Chat, ChatCreationAttrs> {
  @ApiProperty({ example: "asfdfaskjbkz", description: "ID" })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({
    example: "safsafsafqqw2e3d4csa32m",
    description: "From User message",
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: false })
  from_user_id: string;

  @BelongsTo(() => User)
  from_user: User;

  @ApiProperty({
    example: "uaihdnlknwqbajhsdkjda2",
    description: "To User message",
  })
  @ForeignKey(() => User)
  @Column({ type: DataType.UUID, allowNull: true })
  to_user_id: string | null;

  @BelongsTo(() => User)
  to_user: User;

  @ApiProperty({ example: "Hi everyone", description: "User message" })
  @Column({ type: DataType.STRING, allowNull: false })
  message: string;

  @ApiProperty({
    example: "12.11.2000 22:23",
    description: "Time created message",
  })
  @Column({ type: DataType.DATE, defaultValue: Date.now(), allowNull: false })
  created_at: string;
}
