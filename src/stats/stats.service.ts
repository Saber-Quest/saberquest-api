import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class StatsService {
    constructor(private readonly prisma: PrismaService) { }

    async getStats() {
        return {
            users: await this.prisma.user.count(),
            challengesServed: await this.prisma.activatedChallenge.count(),
            challengesCompleted: await this.prisma.challengeHistory.count(),
        };
    }
}
