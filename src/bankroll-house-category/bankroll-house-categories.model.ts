import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";

interface GameSettingsCreationAttrs {
    name: string;
    user_id: string;
    status: number;
}

@Table({ tableName: 'bankroll_house_categories' })
export class BankrollHouseCategory extends Model<BankrollHouseCategory, GameSettingsCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'min_bet', description: 'Setting key' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    name: string;

    @ApiProperty({ example: '1', description: 'Value for setting key' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    status: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;
}
