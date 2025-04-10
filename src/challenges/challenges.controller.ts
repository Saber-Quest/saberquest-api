import { BadRequestException, Controller, Get, Param } from '@nestjs/common';
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

    @Get("map")
    @ApiOperation({ summary: "Get the map for the weekly map challenge." })
    @ApiResponse({ status: 200, description: "Map." })
    getMap() {
        return this.challengesService.getMapChallenge();
    }

    @Get("map/leaderboard/:type")
    @ApiOperation({ summary: "Get the leaderboard for the weekly map challenge." })
    @ApiResponse({ status: 200, description: "Leaderboard." })
    @ApiResponse({ status: 400, description: "Invalid leaderboard type." })
    getMapLeaderboard(
        @Param('type') type: string
    ) {
        const parsedType = parseInt(type);
        if (isNaN(parsedType) || parsedType < 1 || parsedType > 3) throw new BadRequestException("Invalid leaderboard type.");
        return this.challengesService.getMapLeaderboard(parsedType);
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
