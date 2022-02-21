import { BelongsTo, Column, DataType, ForeignKey, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { BankrollInvestor } from '../bankroll-investors/bankroll-investors.model';
import { User } from "src/users/users.model";

interface BancrollInvestorHistoryCreationAttrs {
    amount: number;
    dilution_fee: number;
    type: number;
    added_manually: number;
    investor_id: string;
}

@Table({ tableName: 'bancroll_investor-histories' })
export class BancrollInvestorHistory extends Model<BancrollInvestorHistory, BancrollInvestorHistoryCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 36000.33, description: 'Amount' })
    @Column({ type: DataType.DOUBLE, allowNull: false })
    amount: number;

    @ApiProperty({ example: 1172.32, description: 'Dilution fee' })
    @Column({ type: DataType.DOUBLE })
    dilution_fee: number;

    @ApiProperty({ example: 1, description: 'Type' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    type: number;

    @ApiProperty({ example: 0, description: 'Added manualy' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    added_manually: number;

    @ForeignKey(() => BankrollInvestor)
    @Column({ type: DataType.UUID })
    investor_id: string;

    @BelongsTo(() => BankrollInvestor)
    investor: BankrollInvestor;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;
}
