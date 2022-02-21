import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";

interface UserBonusCreationAttrs {
    type: string;
    amount: string;
    user_id: string;
}

@Table({ tableName: 'user_bonuses' })
export class UserBonus extends Model<UserBonus, UserBonusCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'balance_change', description: 'Bonus type' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    type: string;

    @ApiProperty({ example: 32766, description: 'Bonus amount' })
    @Column({ type: DataType.DOUBLE, allowNull: false })
    amount: string;

    @ForeignKey(() => User)
    @Index({ name: "user_bonuses_user_id_index" })
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;

}
