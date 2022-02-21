import { ApiProperty } from "@nestjs/swagger";

export class GetBetsDto {
    @ApiProperty({ example: 122, description: 'bet number for results' })
    bet_number: number;

    @ApiProperty({ example: 100, description: 'bet' })
    bet: number;

    @ApiProperty({ example: '0 - 50', description: 'selected_range' })
    selected_range: string;

    @ApiProperty({ example: true, description: 'is_winner' })
    is_winner: boolean;

    @ApiProperty({ example: true, description: 'is_auto' })
    is_auto: boolean;

    @ApiProperty({ example: 33.44, description: 'roll_result' })
    roll_result: number;

    @ApiProperty({ example: 3, description: 'invader_color_result' })
    invader_color_result: number;

    @ApiProperty({ example: 'us32rfsdgsfafjksjnmvouivuskjdncawai', description: 'roll_hash' })
    roll_hash: string;

    @ApiProperty({ example: 22222.22, description: 'profit_main' })
    profit_main: number;

    @ApiProperty({ example: 333.22, description: 'profit' })
    profit: number;

    @ApiProperty({ example: 33.33, description: 'color_bet' })
    color_bet: number;

    @ApiProperty({ example: 2212, description: 'type_bet' })
    type_bet: number;

    @ApiProperty({ example: 3, description: 'invader_color' })
    invader_color: number;

    @ApiProperty({ example: 323.44, description: 'invader_type' })
    invader_type: number;

    @ApiProperty({ example: 23433.24, description: 'profit_color' })
    profit_color: number;

    @ApiProperty({ example: 45343.34, description: 'profit_type' })
    profit_type: number;

    @ApiProperty({ example: 32323.33, description: 'house_part_profit' })
    house_part_profit: number;

    @ApiProperty({ example: 3223.33, description: 'investors_part_profit' })
    investors_part_profit: number;

    @ApiProperty({ example: 2222.33, description: 'potential_profit' })
    potential_profit: string;

    @ApiProperty({ example: 2223.3333, description: 'payout' })
    payout: number;

    @ApiProperty({ example: 'us32rfsdgsfafjksjnmvouivuskjdncawai', description: 'user_id' })
    user_id: string;

    @ApiProperty({ example: 'us32rfsdgsfafjksjnmvouivuskjdncawai', description: 'user_seed_id' })
    user_seed_id: string;

    @ApiProperty({ example: { username: 'misha' }, description: 'username' })
    user: {
        username: string;
    };

    @ApiProperty({ example: '2220-9-11 44:33', description: 'createdAt' })
    createdAt: string;

    @ApiProperty({ example: '2220-9-11 44:33', description: 'updatedAt' })
    updatedAt: string;
}