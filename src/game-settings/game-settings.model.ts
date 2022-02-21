import { Column, DataType, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";

interface GameSettingsCreationAttrs {
    key: string;
    value: string;
}

@Table({ tableName: 'game_settings', timestamps: false })
export class GameSetting extends Model<GameSetting, GameSettingsCreationAttrs> {
    @Column({ type: DataType.INTEGER, unique: true, primaryKey: true, autoIncrement: true, })
    id: string;

    @ApiProperty({ example: 'min_bet', description: 'Setting key' })
    @Index({ name: "game_dice_invader_settings_key_index" })
    @Index({ name: "game_dice_invader_settings_key_unique", unique: true })
    @Column({ type: DataType.STRING, unique: true, allowNull: false })
    key: string;

    @ApiProperty({ example: '1', description: 'Value for setting key' })
    @Column({ type: DataType.STRING, allowNull: false })
    value: string;
}
