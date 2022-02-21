import {
  BelongsToMany,
  Column,
  DataType,
  HasMany,
  Index,
  Model,
  Table,
} from "sequelize-typescript";
import { ApiProperty } from "@nestjs/swagger";
import { Role } from "../roles/roles.model";
import { UserRoles } from "../roles/user-roles.model";
import { GameRoll } from "../game-rolls/game-rolls.model";
import { UserSeed } from "../user-seeds/user-seeds.model";

interface UserCreationAttrs {
  email?: string;
  password?: string;
  username?: string;
  wallet_address?: string;
}

@Table({ tableName: "users" })
export class User extends Model<User, UserCreationAttrs> {
  @ApiProperty({ example: "asfdfaskjbkz", description: "ID" })
  @Column({
    type: DataType.UUID,
    unique: true,
    primaryKey: true,
    defaultValue: DataType.UUIDV4,
  })
  id: string;

  @ApiProperty({ example: "user@gmail.com", description: "Email" })
  @Index({ name: "users_email_unique", unique: true })
  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  email: string;

  @ApiProperty({
    example: "uaihdnlknwqbajhsdkjwohuqiwgwhbjkad,kjpiheufibwkajsd",
    description: "Wallet Address",
  })
  @Column({ type: DataType.STRING, unique: true, allowNull: false })
  wallet_address: string;

  @ApiProperty({ example: 2672782782, description: "Nonce for signin" })
  @Column({
    type: DataType.INTEGER,
    allowNull: false,
    defaultValue: () => Math.floor(Math.random() * 1000000),
  })
  nonce: number;

  @ApiProperty({ example: "12345678", description: "Password" })
  @Column({ type: DataType.STRING, allowNull: true })
  password: string;

  @ApiProperty({ example: "user-dog", description: "Username" })
  @Index({ name: "users_username_unique", unique: true })
  @Column({ type: DataType.STRING, unique: true, allowNull: true })
  username: string;

  @ApiProperty({ example: "1asfd234wqwfa5678", description: "Refferer_id" })
  @Index({ name: "users_referrer_id_index" })
  @Column({ type: DataType.STRING, allowNull: true })
  refferer_id: string;

  @ApiProperty({
    example: "12dsv345assdwda678",
    description: "Email verified link",
  })
  @Column({ type: DataType.STRING, allowNull: true })
  email_verify_link: string;

  @ApiProperty({ example: 100, description: "User Balance" })
  @Column({ type: DataType.DOUBLE, defaultValue: 0 })
  balance: number;

  @ApiProperty({ example: 2, description: "User Status" })
  @Column({ type: DataType.INTEGER, defaultValue: 1 })
  status: number;

  @ApiProperty({ example: 12345678, description: "bonus_referee_sign_up" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  bonus_referee_sign_up: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_sign_up" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  bonus_referrer_sign_up: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_game_loss" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  bonus_referrer_game_loss: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_game_win" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  bonus_referrer_game_win: number;

  @ApiProperty({ example: 12345678, description: "bonus_referrer_deposit" })
  @Column({ type: DataType.DOUBLE, allowNull: true })
  bonus_referrer_deposit: number;

  @ApiProperty({
    example: "12:22 - 08.11.21",
    description: "Date when user verified email",
  })
  @Column({ type: DataType.DATE, allowNull: true })
  email_verified_at: Date;

  @ApiProperty({
    example: "12:22 - 08.11.21",
    description: "Date when user last logined",
  })
  @Column({ type: DataType.DATE, allowNull: true })
  last_login_at: Date;

  @ApiProperty({
    example: "safjks.dn;kl/xnlhjsamnd",
    description: "Token for remember",
  })
  @Column({ type: DataType.TEXT, allowNull: true })
  remember_token: string;

  @ApiProperty({
    example: "dsfgsodizlfkx",
    description: "Google 2fa auth secret key",
  })
  @Column({ type: DataType.STRING, allowNull: true })
  google2fa_secret: string;

  @ApiProperty({
    example: "233456",
    description: "Email 2fa auth secret key",
  })
  @Column({ type: DataType.STRING, allowNull: true })
  email2fa_secret: string;

  @ApiProperty({ example: true, description: "Enable 2fa auth" })
  @Column({ type: DataType.BOOLEAN, defaultValue: false })
  enabled_2fa: boolean;

  @BelongsToMany(() => Role, () => UserRoles)
  roles: Role[];

  @HasMany(() => GameRoll)
  game_rolls: GameRoll[];

  @HasMany(() => UserSeed)
  user_seeds: UserSeed[];
}
