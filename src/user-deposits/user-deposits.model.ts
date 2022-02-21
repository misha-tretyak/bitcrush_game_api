import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";

interface UserDepositCreationAttrs {
    cc_amount?: number;
    payment_amount?: number;
    payment_currency: string;
    payment_address: string;
    transaction_id?: string;
    status?: number;
    confirms?: number;
    user_id: string;
}

@Table({ tableName: 'user_deposits' })
export class UserDeposit extends Model<UserDeposit, UserDepositCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 206157.04, description: 'CC Amount' })
    @Column({ type: DataType.DOUBLE })
    cc_amount: number;

    @ApiProperty({ example: 0.00207193, description: 'Payment Amount' })
    @Column({ type: DataType.DOUBLE })
    payment_amount: number;

    @ApiProperty({ example: 'BTC', description: 'Payment Currency' })
    @Column({ type: DataType.STRING, allowNull: false })
    payment_currency: string;

    @ApiProperty({ example: '12asfsad34sgsdve3asf678', description: 'Payment Address' })
    @Column({ type: DataType.STRING, allowNull: false })
    payment_address: string;

    @ApiProperty({ example: '2312jbkjnk124jknnsax90', description: 'Transaction id' })
    @Column({ type: DataType.STRING })
    transaction_id: string;

    @ApiProperty({ example: 0, description: 'Status' })
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    status: number;

    @ApiProperty({ example: 2, description: 'Confirms' })
    @Column({ type: DataType.INTEGER, defaultValue: 0 })
    confirms: number;

    @ForeignKey(() => User)
    @Index({ name: "user_deposits_user_id_index" })
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;
}
