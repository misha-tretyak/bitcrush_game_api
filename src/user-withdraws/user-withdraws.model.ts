import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";

interface UserWithdrawCreationAttrs {
    cc_amount: number;
    payment_amount: number;
    payment_address: string;
    payment_currency: string;
    transaction_id?: string;
    comment?: string;
    status: number;
    confirms: number;
    need_confirm: boolean;
    user_id: string;
}

@Table({ tableName: 'user_withdraws' })
export class UserWithdraw extends Model<UserWithdraw, UserWithdrawCreationAttrs> {
    @ApiProperty({ example: 'asfdfaskjbkz', description: 'ID' })
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 206157.04, description: 'CC Amount' })
    @Column({ type: DataType.DOUBLE, allowNull: false })
    cc_amount: number;

    @ApiProperty({ example: 0.00207193, description: 'Payment Amount' })
    @Column({ type: DataType.DOUBLE, allowNull: false })
    payment_amount: number;

    @ApiProperty({ example: '12asfsad34sgsdve3asf678', description: 'Payment Address' })
    @Column({ type: DataType.STRING, allowNull: false })
    payment_address: string;

    @ApiProperty({ example: 'BTC', description: 'Payment Currency' })
    @Column({ type: DataType.STRING, allowNull: false })
    payment_currency: string;

    @ApiProperty({ example: '2312jbkjnk124jknnsax90', description: 'Transaction id' })
    @Column({ type: DataType.STRING })
    transaction_id: string;

    @ApiProperty({ example: 'this is comment', description: 'Comment' })
    @Column({ type: DataType.STRING })
    comment: string;

    @ApiProperty({ example: 0, description: 'Status' })
    @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
    status: number;

    @ApiProperty({ example: 2, description: 'Confirms' })
    @Column({ type: DataType.INTEGER, defaultValue: 0, allowNull: false })
    confirms: number;

    @ApiProperty({ example: '12345678', description: 'Password' })
    @Column({ type: DataType.BOOLEAN, defaultValue: false, allowNull: false })
    need_confirm: boolean;

    @ForeignKey(() => User)
    @Index({ name: "user_withdraws_user_id_index" })
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;
}
