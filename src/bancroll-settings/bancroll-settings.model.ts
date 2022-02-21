import { Column, DataType, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface BancrollSettingsCreationAttrs {
    key: string;
    value: string;
}

@Table({ tableName: 'bancroll_settings', timestamps: false })
export class BancrollSetting extends Model<BancrollSetting, BancrollSettingsCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, })
    id: string;

    @ApiProperty({ example: 'min_bet', description: 'Setting key' })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    key: string;

    @ApiProperty({ example: '1', description: 'Value for setting key' })
    @Column({ type: DataType.STRING, allowNull: false })
    value: string;
}
