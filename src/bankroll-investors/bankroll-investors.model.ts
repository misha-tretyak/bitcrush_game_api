import { BelongsTo, Column, DataType, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";
import { BancrollInvestorHistory } from '../bancroll-investor-history/bancroll-investor-history.model';

interface BankrollInvestorCreationAttrs {
    user_id: string;
    name: string;
    status: number;
}

@Table({ tableName: 'bankroll-investors' })
export class BankrollInvestor extends Model<BankrollInvestor, BankrollInvestorCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'max_profit', description: 'Setting key' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    name: string;

    @ApiProperty({ example: '1422548.43', description: 'Value for setting key' })
    @Column({ type: DataType.INTEGER, allowNull: false })
    status: number;

    @ForeignKey(() => User)
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;

    @HasMany(() => BancrollInvestorHistory)
    investor_histories: BancrollInvestorHistory[];
}
