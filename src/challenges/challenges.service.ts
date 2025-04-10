import { BadRequestException, Injectable, NotFoundException, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { PrismaService } from 'src/prisma/prisma.service';
import { beatLeader } from 'src/util/challenges/beatleader/complete';
import { scoreSaber } from 'src/util/challenges/scoresaber/complete';
import { Checker } from 'src/util/challenges/checker';
import { giveRewards } from 'src/util/challenges/giveReward';
import { updateRanks } from 'src/util/calculateValue';
import { mapChallenge } from 'src/util/challenges/mapChallenge';
import { BeatSaver } from 'yabsl';

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

    async getMapChallenge() {
        const challenge = await this.prisma.mapChallenge.findFirst({
            orderBy: {
                startedOn: "desc"
            }
        });

        if (!challenge) throw new NotFoundException();

        const map = await fetch(`https://beatsaver.com/api/maps/id/${challenge.mapId}`).then(res => res.json());

        return {
            mapId: challenge.mapId,
            mapHash: challenge.mapHash,
            name: map.name,
            mappers: map.metadata.levelAuthorName,
            image: map.versions[0].coverURL,
            downloadURL: map.versions[0].downloadURL,
            startedOn: challenge.startedOn.setUTCHours(0, 0, 0, 0),
            willEnd: challenge.startedOn.setUTCHours(0, 0, 0, 0) + (60 * 60 * 24 * 7 * 1000)
        }
    }

    async getMapLeaderboard(type: number) {
        const leaderboard = await this.prisma.mapChallengeLeaderboard.findMany({
            where: {
                tier: type
            },
            orderBy: {
                score: "desc"
            },
            include: {
                user: true
            },
            take: 10
        });

        let rank = 1;

        return leaderboard.map(l => {
            return {
                user: {
                    id: l.user.id,
                    username: l.user.username,
                    images: {
                        avatar: l.user.avatar,
                        banners: {
                            vertical: l.user.banner + "?type=ver",
                            horizontal: l.user.banner + "?type=hor"
                        },
                        border: l.user.border
                    },
                    patreon: l.user.patreon,
                },
                rank: rank++,
                score: l.score
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

            let completed = false;

            const challengeValues = difficulty.values.map(value => value.toNumber());

            if (user.preference == 1) {
                completed = await beatLeader(challenge?.challengeSet.type as Checker, challengeValues, user.id);
            } else {
                completed = await scoreSaber(challenge?.challengeSet.type as Checker, challengeValues, user.id);
            }

            if (!completed) continue;

            await giveRewards(user.id, user.diff, challenge.id);

            completedUsers++;

            new Promise(resolve => setTimeout(resolve, 1000));
        }

        await updateRanks();

        this.logger.log(`Bi-hourly challenge completion finished. ${completedUsers}/${totalUsers} users completed.`);
    }

    @Cron("5 */4 * * *")
    async mapChallenge() {
        this.logger.log("Running map challenge completion...");
        const users = await this.prisma.user.findMany({
            where: {
                doesMapChallenge: true
            }
        });

        let totalUsers = users.length;
        let completedUsers = 0;

        for (const user of users) {
            if (await mapChallenge(user.id, user.preference)) completedUsers++;
            await new Promise((resolve) => setTimeout(resolve, 1000));
        }

        this.logger.log(`Map challenge completion finished. ${completedUsers}/${totalUsers} users had new/better score.`);
    }
}
