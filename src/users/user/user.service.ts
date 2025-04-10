import { Injectable, NotFoundException, UnauthorizedException, HttpException, BadRequestException, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUser } from './dto/create-user.dto';
import { Prisma, User } from '@prisma/client';
import { verifyToken } from 'src/util/jwt';
import { UpdateUser } from './dto/update-user.dto';
import { beatLeader } from 'src/util/challenges/beatleader/complete';
import { Checker } from 'src/util/challenges/checker';
import { scoreSaber } from 'src/util/challenges/scoresaber/complete';
import { giveRewards } from 'src/util/challenges/giveReward';
import { createImageBuffer, downloadAvatar, downloadBanner } from 'src/util/images';
import { updateRanks } from 'src/util/calculateValue';

enum Service {
    BeatLeader = 1,
    ScoreSaber = 2
}

enum Difficulty {
    Normal = 1,
    Hard = 2,
    Expert = 3
}

@Injectable()
export class UserService {
    constructor(private readonly prisma: PrismaService) { }

    callbacks: { identifier: string, callback: string }[] = [];
    activeRequests: string[] = [];

    async getLastRank() {
        return await this.prisma.user.findFirst({
            select: {
                rank: true
            },
            orderBy: {
                rank: "desc"
            }
        });
    }

    async getUsers(page: number = 1, limit: number = 25, sorting: "rank" | "qp" = "rank", order: "asc" | "desc" = "asc", search: string = "") {
        let rank = (page - 1) * limit + 1 as number;
        const users = await this.prisma.user.findMany({
            skip: (page - 1) * limit,
            take: limit,
            orderBy: {
                [sorting]: order
            },
            where: {
                username: { contains: search }
            },
            include: {
                challengeHistories: true
            }
        });

        return users.map(u => {
            return {
                info: {
                    id: u.id,
                    username: u.username,
                    about: u.about,
                    images: {
                        avatar: u.avatar,
                        banners: {
                            vertical: u.banner + "?type=ver",
                            horizontal: u.banner + "?type=hor"
                        },
                        border: u.border
                    },
                    preference: u.preference,
                    patreon: u.patreon,
                    autocomplete: u.autoComplete,
                    banned: u.banned
                },
                stats: {
                    challengesCompleted: u.challengeHistories.length,
                    rank: rank++,
                    qp: u.qp,
                    value: u.value
                },
                today: {
                    difficulty: u?.diff,
                    completed: u.challengeHistories[0] ? u?.challengeHistories[0].completedAt.setUTCHours(0, 0, 0, 0) == new Date().setUTCHours(0, 0, 0, 0) : false
                }
            }
        });
    }

    async getUser(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            include: { challengeHistories: true }
        });

        if (!user) throw new NotFoundException();

        return {
            info: {
                id: user?.id,
                username: user?.username,
                about: user?.about,
                images: {
                    avatar: user?.avatar,
                    banners: {
                        vertical: user?.banner + "?type=ver",
                        horizontal: user?.banner + "?type=hor"
                    },
                    border: user?.border
                },
                preference: user?.preference,
                patreon: user?.patreon,
                autocomplete: user?.autoComplete,
                banned: user?.banned
            },
            stats: {
                challengesCompleted: user?.challengeHistories.length,
                rank: user?.rank,
                qp: user?.qp,
                value: user?.value
            },
            today: {
                difficulty: user?.diff,
                completed: user.challengeHistories[0] ? user?.challengeHistories[0].completedAt.setUTCHours(0, 0, 0, 0) == new Date().setUTCHours(0, 0, 0, 0) : false
            }
        }
    }

    async getUserAll(id: string) {
        const history = await this.prisma.challengeHistory.findMany({
            where: {
                userId: id
            },
            include: {
                user: {
                    include: {
                        ownership: {
                            include: {
                                item: true
                            }
                        }
                    }
                },
                challenge: true,
                difficulty: true,
                items: {
                    include: {
                        item: true
                    }
                },
            },
            orderBy: {
                completedAt: "desc"
            },
            take: 10
        });

        try {

            const challengeHistory = history.map(h => {
                const items = h.items.map(i => {
                    return {
                        name: i?.item.name,
                        image: i?.item.image,
                        rarity: i?.item.rarity
                    };
                });

                return {
                    date: h.completedAt,
                    items: items,
                    qp: h.qp,
                    challenge: {
                        name: h.challenge.name,
                        description: h.challenge.description,
                        type: h.challenge.type,
                        difficulty: {
                            name: Difficulty[h.difficulty.difficulty],
                            challenge: h.difficulty.values
                        },
                        completedOn: h.preference
                    }
                };
            });

            const inventoryMapped = history[0].user.ownership.map(i => {
                return {
                    id: i.itemId,
                    name: i.item.name,
                    rarity: i.item.rarity,
                    image: i.item.image,
                    amount: i.amount
                }
            });

            const allHistory = await this.prisma.challengeHistory.count({
                where: {
                    userId: id
                }
            });

            return {
                info: {
                    id: history[0].userId,
                    username: history[0].user.username,
                    about: history[0].user.about,
                    images: {
                        avatar: history[0].user.avatar,
                        banners: {
                            vertical: history[0].user.banner + "?type=ver",
                            horizontal: history[0].user.banner + "?type=hor"
                        },
                        border: history[0].user.border
                    },
                    preference: history[0].user.preference,
                    patreon: history[0].user.patreon,
                    autocomplete: history[0].user.autoComplete,
                    banned: history[0].user.banned,
                },
                stats: {
                    challengesCompleted: allHistory,
                    rank: history[0].user.rank,
                    qp: history[0].user.qp,
                    value: history[0].user.value
                },
                today: {
                    difficulty: history[0].user.diff,
                    completed: history[0].completedAt.setUTCHours(0, 0, 0, 0) == new Date().setUTCHours(0, 0, 0, 0)
                },
                inventory: inventoryMapped,
                challengeHistory: challengeHistory
            }
        } catch {
            const user = await this.prisma.user.findFirst({
                where: {
                    id: id
                },
                include: {
                    ownership: {
                        include: {
                            item: true
                        }
                    }
                }
            });

            if (!user) throw new NotFoundException();

            const inventoryMapped = user.ownership.map(i => {
                return {
                    id: i.itemId,
                    name: i.item.name,
                    rarity: i.item.rarity,
                    image: i.item.image,
                    amount: i.amount
                }
            });

            return {
                info: {
                    id: user?.id,
                    username: user?.username,
                    about: user?.about,
                    images: {
                        avatar: user?.avatar,
                        banners: {
                            vertical: user?.banner + "?type=ver",
                            horizontal: user?.banner + "?type=hor"
                        },
                        border: user?.border
                    },
                    preference: user?.preference,
                    patreon: user?.patreon,
                    autocomplete: user?.autoComplete,
                    banned: user?.banned
                },
                stats: {
                    challengesCompleted: 0,
                    rank: user?.rank,
                    qp: user?.qp,
                    value: user?.value
                },
                today: {
                    difficulty: user?.diff,
                    completed: false
                },
                inventory: inventoryMapped,
                challengeHistory: []
            }
        }
    }

    async getChallengeHisotry(id: string, page: number, limit: number) {
        const challengeHistories = await this.prisma.challengeHistory.findMany({
            where: {
                userId: id
            },
            orderBy: {
                completedAt: "desc"
            },
            include: {
                items: {
                    include: {
                        item: true
                    }
                },
                challenge: true,
                difficulty: true
            },
            skip: (page - 1) * limit,
            take: limit
        });

        if (!challengeHistories) throw new NotFoundException();

        return challengeHistories.map(h => {
            return {
                date: h.completedAt,
                items: h.items.map(i => {
                    return {
                        name: i.item.name,
                        image: i.item.image,
                        rarity: i.item.rarity
                    }
                }),
                qp: h.qp,
                challenge: {
                    name: h.challenge.name,
                    description: h.challenge.description,
                    type: h.challenge.type,
                    difficulty: {
                        name: Difficulty[h.difficulty.difficulty],
                        challenge: h.difficulty.values
                    },
                    completedOn: h.preference
                }
            }
        })
    }

    async getItems(id: string) {
        const user = await this.prisma.user.findFirst({
            where: { id },
            include: {
                ownership: {
                    include: {
                        item: true
                    }
                }
            }
        });

        if (!user) throw new NotFoundException();

        const inventoryMapped = user.ownership.map(i => {
            return {
                id: i.itemId,
                name: i.item.name,
                rarity: i.item.rarity,
                image: i.item.image,
                amount: i.amount
            }
        });

        return inventoryMapped;
    }

    async createUser(user: CreateUser): Promise<{ code: number, response: string | User }> {
        if (user.privateKey !== process.env.PRIVATE_KEY as string) throw new UnauthorizedException();

        const exists = await this.prisma.user.findFirst({ where: { id: user.id } });

        if (exists) throw new BadRequestException("User already exists.");

        const rank = (await this.getLastRank())?.rank! + 1;

        const newUser = await this.prisma.user.create({
            data: {
                id: user.id,
                username: user.username,
                rank: isNaN(rank) ? 1 : rank,
                preference: user.preference,
                avatar: `${process.env.REDIRECT_URI_API}/assets/${user.id}/avatar`
            } as Prisma.UserUncheckedCreateInput
        });

        if (newUser) throw new HttpException(newUser, 201);

        throw new InternalServerErrorException();
    }

    async update(body: UpdateUser, auth: string) {
        const verified = verifyToken(auth.split(" ")[1]);

        if (!verified || verified.exp < Date.now()) throw new UnauthorizedException();

        try {
            if (body.property == "banner") {
                const banner = createImageBuffer(body.image!);

                downloadBanner(banner, verified.id, body.type!);

                await this.prisma.user.update({
                    where: { id: verified.id },
                    data: { [body.property]: `${process.env.REDIRECT_URI_API}/assets/${verified.id}/banner` }
                })
            } else if (body.property == "avatar") {
                const avatar = createImageBuffer(body.image!);

                downloadAvatar(avatar, verified.id);
            }
            else {
                await this.prisma.user.update({
                    where: { id: verified.id },
                    data: { [body.property]: body.value }
                });
            }
        } catch (e) {
            console.log(e);
            throw new InternalServerErrorException();
        }

        return "Updated.";
    }

    async completeChallenge(id: string, auth: string) {
        const verified = verifyToken(auth.split(" ")[1]);

        if (!verified || verified.exp < Date.now()) throw new UnauthorizedException();

        const user = await this.prisma.user.findFirst({
            where: {
                id: verified.id,
                diff: {
                    not: 0
                }
            }
        });

        if (!user) throw new NotFoundException();

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

        if (!challenge) throw new NotFoundException();

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

        if (alreadyCompleted) throw new BadRequestException("Challenge already completed.");

        const difficulty = challenge?.challengeSet.difficulties.find(d => d.difficulty == user.diff);

        if (!difficulty) throw new NotFoundException();

        let completed;

        const challengeValues = difficulty.values.map(value => value.toNumber());

        if (user.preference == 1) {
            completed = await beatLeader(challenge.challengeSet.type as Checker, challengeValues, user.id);
        } else {
            completed = await scoreSaber(challenge.challengeSet.type as Checker, challengeValues, user.id);
        }

        if (!completed) throw new BadRequestException("Challenge not completed.");

        const rewards = await giveRewards(user.id, user.diff, challenge.challengeSetId);

        await updateRanks();

        return rewards;
    }
}
