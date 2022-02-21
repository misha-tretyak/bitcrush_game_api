import { Column, DataType, Index, Model, Sequelize, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface SettingsCreationAttrs {
    key: string;
    value: string;
}

@Table({ tableName: 'settings', timestamps: false })
export class Setting extends Model<Setting, SettingsCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, })
    id: string;

    @ApiProperty({ example: 'max_profit', description: 'Setting key' })
    @Index({ name: 'settings_key_unique', unique: true })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    key: string;

    @ApiProperty({ example: '1422548.43', description: 'Value for setting key' })
    @Column({ type: DataType.STRING, allowNull: false })
    value: string;
}
