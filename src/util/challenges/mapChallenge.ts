import { PrismaClient } from "@prisma/client";
import { BeatLeader, ScoreSaber } from "yabsl";

export async function mapChallenge(id: string, platform: number): Promise<boolean> {
    const prisma = new PrismaClient();

    try {
        await prisma.$connect();

        const user = await prisma.user.findFirst({
            where: {
                id: id,
                doesMapChallenge: true
            },
            include: {
                mapChallengeLeaderboard: {
                    include: {
                        mapChallenge: true
                    },
                    where: {
                        userId: id
                    }
                }
            }
        });

        const map = await prisma.mapChallenge.findFirst({
            orderBy: {
                startedOn: "desc"
            }
        });

        if (!user) return false;

        const leaderboard = user.mapChallengeLeaderboard.find((l) => l.mapChallengeId === map?.id);

        if (platform === 1) {
            const scores = await BeatLeader.scores.getCompact(id, {
                page: 1,
                count: 50
            });

            scores.data.forEach(async (score) => {
                if (score.leaderboard.songHash === map?.mapHash) {
                    if (!leaderboard) {
                        await prisma.mapChallengeLeaderboard.create({
                            data: {
                                userId: id,
                                score: score.score.baseScore,
                                mapChallengeId: map?.id,
                                tier: 0,
                                completedOn: new Date()
                            }
                        });

                        return true;
                    } else {
                        if (score.score.baseScore > leaderboard.score) {
                            await prisma.mapChallengeLeaderboard.update({
                                where: {
                                    id: leaderboard.id
                                },
                                data: {
                                    score: score.score.baseScore,
                                    completedOn: new Date()
                                }
                            });

                            return true;
                        }
                    }
                }
            });

            return false;
        } else if (platform === 2) {
            const scores = await ScoreSaber.players.scores(id, "recent", 1, 50, false);

            scores.playerScores.forEach(async (score) => {
                if (score.leaderboard.songHash === map?.mapHash && new Date(score.score.timeSet) > map.startedOn) {
                    if (!leaderboard) {
                        await prisma.mapChallengeLeaderboard.create({
                            data: {
                                userId: id,
                                score: score.score.baseScore,
                                mapChallengeId: map?.id,
                                tier: 0,
                                completedOn: new Date()
                            }
                        });

                        return true;
                    } else {
                        if (score.score.baseScore > leaderboard.score) {
                            await prisma.mapChallengeLeaderboard.update({
                                where: {
                                    id: leaderboard.id
                                },
                                data: {
                                    score: score.score.baseScore,
                                    completedOn: new Date()
                                }
                            });

                            return true;
                        }

                        return false;
                    }
                }
            });

            return false;
        }

        return false;
    } catch (e) {
        console.error(e);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}