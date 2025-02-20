import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { beatLeader } from 'src/util/challenges/beatleader/complete';
import { scoreSaber } from 'src/util/challenges/scoresaber/complete';
import { Checker } from 'src/util/challenges/checker';
import { giveRewards } from 'src/util/challenges/giveReward';
import { updateRanks } from 'src/util/calculateValue';

enum Difficulty {
    Normal = 1,
    Hard = 2,
    Expert = 3
}

@Injectable()
export class ChallengesService {
    private readonly logger = new Logger(ChallengesService.name);
    constructor(private readonly prisma: PrismaService) { };

    async getDaily() {
        return await this.prisma.activatedChallenge.findFirst({
            orderBy: {
                date: "desc"
            },
            include: {
                challengeSet: {
                    include: {
                        difficulties: true
                    }
                }
            }
        }).then(c => {
            return {
                challengeSet: {
                    id: c?.challengeSet.id,
                    name: c?.challengeSet.name,
                    description: c?.challengeSet.description,
                    type: c?.challengeSet.type,
                    image: c?.challengeSet.image
                },
                difficulties: c?.challengeSet.difficulties.map(d => {
                    let values = d.values.length == 2 ? [d.values[0], d.values[1]] : d.values.length == 3 ? [d.values[0], d.values[1], d.values[2]] : [d.values[0], d.values[0]];

                    return {
                        difficulty: Difficulty[d.difficulty],
                        color: d.color,
                        beatleader: values[1].toNumber(),
                        scoresaber: values[0].toNumber(),
                        additional: values[2] ? values[2].toNumber() : null
                    }
                }),
                date: c?.date
            }
        });
    }

    async getChallenge(challengeId: string) {
        const id = Number(challengeId);
        if (isNaN(id) || id < 0) throw new BadRequestException();

        const c = await this.prisma.challengeSet.findFirst({
            where: {
                id: id
            },
            include: {
                difficulties: true
            }
        });

        if (!c) throw new NotFoundException();

        return {
            id: c?.id,
            name: c?.name,
            description: c?.description,
            type: c?.type,
            image: c?.image,
            difficulties: c?.difficulties.map(d => {
                return {
                    difficulty: Difficulty[d.difficulty],
                    color: d.color,
                    beatleader: d.values[1].toNumber(),
                    scoresaber: d.values[0].toNumber()
                }
            })
        }
    }

    async getAll() {
        return (await this.prisma.challengeSet.findMany({
            include: {
                difficulties: true
            },
            orderBy: {
                id: "asc"
            }
        })).map(c => {
            return {
                id: c?.id,
                name: c?.name,
                description: c?.description,
                type: c?.type,
                image: c?.image,
                difficulties: c?.difficulties.map(d => {
                    const values = d.values.length == 2 ? [d.values[0], d.values[1]] : [d.values[0], d.values[0]];
                    return {
                        difficulty: Difficulty[d.difficulty],
                        color: d.color,
                        beatleader: values[1].toNumber(),
                        scoresaber: values[0].toNumber()
                    }
                })
            }
        });
    }

    @Cron("0 * * * *")
    async switchDaily() {
        const date = new Date().setUTCHours(0, 0, 0, 0);

        const challengeSets = await this.prisma.challengeSet.findMany();

        let activatedChallenges = await this.prisma.activatedChallenge.findMany({
            orderBy: { date: 'desc' },
            take: challengeSets.length,
        });

        this.logger.log('Running daily challenge switch...');

        if (date == activatedChallenges[0].date.setUTCHours(0, 0, 0, 0)) return this.logger.log("Not yet.");

        let possibleChallenges = [...challengeSets];

        if (activatedChallenges.length === challengeSets.length) {
            this.logger.log("All challenges exhausted. Resetting the pool.");
            activatedChallenges = [];
            possibleChallenges = [...challengeSets];
        } else {
            possibleChallenges = possibleChallenges.filter(possibleChallenge =>
                !activatedChallenges.some(activated => activated.challengeSetId === possibleChallenge.id)
            );
        }

        const newChallenge = possibleChallenges[Math.floor(Math.random() * possibleChallenges.length)];

        if (!newChallenge) {
            this.logger.error("Unexpected error: No challenges available after filtering.");
            return;
        }

        this.logger.log(`Selected new challenge: ${newChallenge.name}`);

        await this.prisma.activatedChallenge.create({
            data: {
                challengeSetId: newChallenge.id,
                date: new Date(),
            },
        });

        this.logger.log(`Challenge ${newChallenge.name} activated successfully.`);
    }

    @Cron("0 */2 * * *")
    async autoComplete() {
        this.logger.log("Running bi-hourly challenge completion...");
        let totalUsers = 0;
        let completedUsers = 0;

        const users = await this.prisma.user.findMany({
            where: {
                autoComplete: true,
                diff: {
                    not: 0
                }
            }
        });

        totalUsers = users.length;

        for (const user of users) {
            const challenge = await this.prisma.activatedChallenge.findFirst({
                orderBy: {
                    date: "desc"
                },
                include: {
                    challengeSet: {
                        include: {
                            difficulties: true
                        }
                    }
                }
            });

            if (!challenge) continue;

            const today = new Date().setUTCHours(0, 0, 0, 0);

            const alreadyCompleted = await this.prisma.challengeHistory.findFirst({
                where: {
                    userId: user.id,
                    completedAt: {
                        gte: new Date(today),
                        lte: new Date()
                    }
                }
            });

            if (alreadyCompleted) continue;

            const difficulty = challenge?.challengeSet.difficulties.find(d => d.difficulty == user.diff);

            if (!difficulty) continue;

            let completed;

            const challengeValues = difficulty.values.map(value => value.toNumber());

            if (user.preference == 1) {
                completed = await beatLeader(challenge?.challengeSet.name as Checker, challengeValues, user.id);
            } else {
                completed = await scoreSaber(challenge?.challengeSet.name as Checker, challengeValues, user.id);
            }

            if (!completed) continue;

            await giveRewards(user.id, user.diff, challenge.id);

            completedUsers++;

            new Promise(resolve => setTimeout(resolve, 1000));
        }

        await updateRanks();

        this.logger.log(`Bi-hourly challenge completion finished. ${completedUsers}/${totalUsers} users completed.`);
    }
}
