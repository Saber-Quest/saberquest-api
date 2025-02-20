import { Item, PrismaClient } from "@prisma/client";
import { calculateValue } from "../calculateValue";

function rarityTable(difficulty: number) {
    const table: Record<number, Record<number, number>> = {
        1: {
            1: 25,
            2: 15,
            3: 4,
            4: 1,
        },
        2: {
            1: 23,
            2: 16,
            3: 6,
            4: 2,
        },
        3: {
            1: 20,
            2: 18,
            3: 6,
            4: 2
        }
    }

    return table[difficulty]
}

function getQp(difficulty: number) {
    const qpTable: Record<number, number[]> = {
        1: [10, 15],
        2: [13, 18],
        3: [15, 20]
    }

    return qpTable[difficulty];
}

export async function giveRewards(id: string, difficulty: number, challengeId: number) {
    const prisma = new PrismaClient();
    try {
        prisma.$connect();

        const player = await prisma.user.findFirst({ where: { id } });

        if (!player) {
            prisma.$disconnect();
            return;
        }

        const weightTable = rarityTable(difficulty);

        const items = await prisma.item.findMany();

        let weightedPool: Item[] = [];
        items.forEach(item => {
            const weight = weightTable[item.rarity] || 0;
            for (let i = 0; i < weight; i++) {
                weightedPool.push(item);
            }
        });

        let chosenItems: Item[] = [];

        for (let i = 0; i < Math.floor(Math.random() * 2) + 1 && weightedPool.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            const item = weightedPool[randomIndex];

            chosenItems.push(item);

            weightedPool = weightedPool.filter(i => i.id !== item.id);
        }

        const range = getQp(difficulty);

        const qp = Math.random() * (range[1] - range[0]) + range[0];

        const history = await prisma.challengeHistory.create({
            data: {
                userId: id,
                challengeId: challengeId,
                difficultyId: difficulty,
                completedAt: new Date(),
                preference: player.preference,
                qp: qp
            }
        });

        for (const item of chosenItems) {
            await prisma.ownership.updateMany({
                where: {
                    itemId: item.id,
                    userId: id
                },
                data: {
                    amount: {
                        increment: 1
                    }
                }
            }).then(async u => {
                if (u.count === 0) {
                    await prisma.ownership.create({
                        data: {
                            amount: 1,
                            item: {
                                connect: {
                                    id: item.id
                                }
                            },
                            user: {
                                connect: {
                                    id
                                }
                            }
                        }
                    });
                }
            });

            await prisma.challengeHistoryItem.create({
                data: {
                    challengeHistoryId: history.id,
                    itemId: item.id
                }
            });
        }

        const value = await calculateValue(id);

        await prisma.user.update({
            where: { id },
            data: {
                qp: {
                    increment: qp
                },
                value: value
            }
        });

        return {
            qp,
            value,
            items: chosenItems
        };
    } catch (e) {
        throw e.message;
    } finally {
        prisma.$disconnect();
    }
}