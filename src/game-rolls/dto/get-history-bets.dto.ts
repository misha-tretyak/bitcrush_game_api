import { ApiProperty } from "@nestjs/swagger";

export class GetHistoryBetsDto {
    @ApiProperty({ example: 'us32rfsdgsfafjksjnmvouivuskjdncawai', description: 'user_id' })
    id: string;

    @ApiProperty({ example: 3233, description: 'number for bet result' })
    bet_number: number;

    @ApiProperty({ example: 555555.22, description: 'bet' })
    bet: number;

    @ApiProperty({ example: 2222.25, description: 'color_bet' })
    color_bet: number;

    @ApiProperty({ example: 23728.32, description: 'type_bet' })
    type_bet: number;

    @ApiProperty({ example: 37283923.32, description: 'invader_color' })
    invader_color: number;

    @ApiProperty({ example: 10000, description: 'invader_type bets' })
    invader_type: number;

    @ApiProperty({ example: '0 - 50', description: 'selected_range' })
    selected_range: string;

    @ApiProperty({ example: true, description: 'is_winner' })
    is_winner: boolean;

    @ApiProperty({ example: 21.22, description: 'roll_result' })
    roll_result: number;

    @ApiProperty({ example: 2, description: 'invader_color_result' })
    invader_color_result: number;

    @ApiProperty({ example: 'adbvsiuzkhawbuyjhdnbc', description: 'roll_hash' })
    roll_hash: string;

    @ApiProperty({ example: 10000, description: 'profit_main' })
    profit_main: number;

    @ApiProperty({ example: 10000, description: 'profit_color' })
    profit_color: number;

    @ApiProperty({ example: 10000, description: 'profit_type' })
    profit_type: number;

    @ApiProperty({ example: 10000, description: 'total profit' })
    profit: number;

    @ApiProperty({ example: 33, description: 'house_part_profit' })
    house_part_profit: number;

    @ApiProperty({ example: 44, description: 'investors_part_profit' })
    investors_part_profit: number;

    @ApiProperty({ example: '0 - 60', description: 'potential_profit' })
    potential_profit: string;

    @ApiProperty({ example: 2.33333, description: 'payout' })
    payout: number;

    @ApiProperty({ example: false, description: 'is_auto roll' })
    is_auto: boolean;

    @ApiProperty({ example: '2220-9-11 44:33', description: 'created_at' })
    created_at: string;

    @ApiProperty({ example: 'afdvbfsbsdvdsfzvr', description: 'user_id' })
    user_id: string;

    @ApiProperty({ example: 'dsfbjksasdvhjknsfdnvj', description: 'user_seed_id' })
    user_seed_id: string;

    @ApiProperty({ example: '2220-9-11 44:33', description: 'createdAt' })
    createdAt: string;

    @ApiProperty({ example: '2220-9-11 44:33', description: 'updatedAt' })
    updatedAt: string;
}