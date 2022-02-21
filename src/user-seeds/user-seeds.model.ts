import { BelongsTo, Column, DataType, ForeignKey, HasMany, Index, Model, Table } from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { User } from "src/users/users.model";
import { GameRoll } from "src/game-rolls/game-rolls.model";

interface UserSeedCreationAttrs {
    server_seed_public: string;
    server_seed_private: string;
    client_seed: string;
    is_active: boolean;
    is_next_unused: boolean;
    user_id: string;
}

@Table({ tableName: 'user_seeds' })
export class UserSeed extends Model<UserSeed, UserSeedCreationAttrs> {
    @Column({ type: DataType.UUID, unique: true, primaryKey: true, defaultValue: DataType.UUIDV4 })
    id: string;

    @ApiProperty({ example: 'afsdvsvfbskbz,zswrfe23', description: 'Client Seed Public' })
    @Column({ type: DataType.STRING, allowNull: false })
    server_seed_public: string;

    @ApiProperty({ example: 'dsgbsxgdbtresegfd', description: 'Client Seed Private' })
    @Column({ type: DataType.STRING, allowNull: false })
    server_seed_private: string;

    @ApiProperty({ example: 'dsgdgsdgsdg', description: 'Client Seed' })
    @Column({ type: DataType.STRING, allowNull: false })
    client_seed: string;

    @ApiProperty({ example: true, description: 'Active' })
    @Column({ type: DataType.BOOLEAN, defaultValue: true, allowNull: false })
    is_active: boolean;

    @ApiProperty({ example: false, description: 'Next unused' })
    @Column({ type: DataType.BOOLEAN, defaultValue: true, allowNull: false })
    is_next_unused: boolean;

    @ForeignKey(() => User)
    @Index({ name: "user_seeds_user_id_index" })
    @Column({ type: DataType.UUID })
    user_id: string;

    @BelongsTo(() => User)
    user: User;

    @HasMany(() => GameRoll)
    game_rolls: GameRoll[];
}
