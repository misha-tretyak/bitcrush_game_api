import { ApiProperty } from "@nestjs/swagger";

export class GetLeaderboardDto {
    @ApiProperty({ example: 'us32rfsdgsfafjksjnmvouivuskjdncawai', description: 'user_id' })
    user_id: string;

    @ApiProperty({ example: 'user-test', description: 'username' })
    username: string;

    @ApiProperty({ example: 555555.22, description: 'profit' })
    profit: number;

    @ApiProperty({ example: 2222.25, description: 'profit_ath' })
    profit_ath: number;

    @ApiProperty({ example: 23728.32, description: 'max_wagerv' })
    max_wager: number;

    @ApiProperty({ example: 37283923.32, description: 'wagared' })
    wagared: number;

    @ApiProperty({ example: 10000, description: 'total bets' })
    bets: number;

    @ApiProperty({ example: 1, description: 'number of leader' })
    number: number;
}

