import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";
import { BankrollHouseCategory } from "src/bankroll-house-category/bankroll-house-categories.model";

interface BankrollHouseHistoryCreationAttrs {
    amount: number;
    type: number;
    user_id: string;
    category_id: string;
}

@Table({ tableName: 'bankroll_house_histories' })
export class BankrollHouseHistory extends Model<BankrollHouseHistory, BankrollHouseHistoryCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'min_bet', description: 'Setting key' })
    @Column({ type: DataType.INTEGER, unique: true, allowNull: false })
    amount: number;

    @ApiProperty({ example: '1', description: 'Value for setting key' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    type: number;


    @ForeignKey(() => User)
    @Index({ name: "bankroll_house_histories_user_id_foreign" })
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;

    @ForeignKey(() => BankrollHouseCategory)
    @Index({ name: "bankroll_house_histories_category_id_foreign" })
    @Column({ type: DataType.UUID })
    category_id: string;

    @BelongsTo(() => BankrollHouseCategory)
    category: BankrollHouseCategory;
}
