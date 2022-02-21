import { Body, Controller, Get, Post, Req } from "@nestjs/common";
import { ApiTags, ApiOperation } from "@nestjs/swagger";
import { ProbablyFairService } from "./probably-fair.service";
import { Request } from 'express';
import { IChangeProbablyFairSeed, IVerifyProbablyFair } from '../interfaces';

@ApiTags('ProbablyFair')
@Controller('probably-fair')
export class ProbablyFairController {
    constructor(
        private readonly probablyFairService: ProbablyFairService,
    ) { }

    @ApiOperation({ summary: 'Probably Fair Verify Roll Game' })
    // @ApiResponse({ status: 200, type: [GetLeaderboardDto] })
    // @ApiBearerAuth('JWT')

    @Post('/verify')
    verify(@Body() data: IVerifyProbablyFair): Promise<number> {
        return this.probablyFairService.verify(data);
    }

    @ApiOperation({ summary: 'Probably Fair Get Seeds' })
    // @ApiResponse({ status: 200, type: [GetLeaderboardDto] })
    // @ApiBearerAuth('JWT')

    @Get('/seeds/:user_id')
    getSeeds(@Req() req: Request) {
        return this.probablyFairService.getSeeds(req.params.user_id);
    }

    @ApiOperation({ summary: 'Probably Fair Change Seed' })
    // @ApiResponse({ status: 200, type: [GetLeaderboardDto] })
    // @ApiBearerAuth('JWT')

    @Post('/seed')
    changeSeed(@Body() body: IChangeProbablyFairSeed) {
        return this.probablyFairService.changeSeed(body);
    }

}