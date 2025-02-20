import { Controller, Get, Param } from '@nestjs/common';
import { ChallengesService } from './challenges.service';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('challenges')
export class ChallengesController {
    constructor (private readonly challengesService: ChallengesService) { }

    @Get()
    @ApiOperation({ summary: "Get all challenges." })
    @ApiResponse({ status: 200, description: "All challenges." })
    getAll() {
        return this.challengesService.getAll();
    }

    @Get("/daily")
    @ApiOperation({ summary: "Get the daily challenge." })
    @ApiResponse({ status: 200, description: "Daily challenge." })
    getDaily() {
        return this.challengesService.getDaily();
    }

    @Get(":id")
    @ApiOperation({ summary: "Get a specific challenge." })
    @ApiResponse({ status: 200, description: "Challenge." })
    @ApiResponse({ status: 400, description: "Invalid challenge ID." })
    @ApiResponse({ status: 404, description: "Challenge not found." })
    getChallenge(
        @Param('id') id: string
    ) {
        return this.challengesService.getChallenge(id);
    }
}
