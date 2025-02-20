import { PrismaClient } from "@prisma/client";

export async function calculateValue(id: string) {
    const prisma = new PrismaClient();
    try {
        prisma.$connect();

        const items = await prisma.ownership.findMany({ where: {
            userId: id,
            amount: {
                gt: 0
            }
        }, include: { item: true } });

        if (!items) {
            prisma.$disconnect();
            return;
        }

        const value = items.reduce((acc, item) => acc + (item.item.value ?? 0), 0);

        return value;
    } catch (error) {
        console.error(error);
    }
    finally {
        prisma.$disconnect();
    }
}

export async function updateRanks() {
    const prisma = new PrismaClient();
    try {
        prisma.$connect();

        const users = await prisma.user.findMany({
            orderBy: {
                value: "desc"
            }
        });

        if (!users) {
            prisma.$disconnect();
            return;
        }

        const ranks = users.map((user, index) => prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                rank: index + 1
            }
        }));

        await prisma.$transaction(ranks);

        return;
    } catch (error) {
        console.error(error);
    }
    finally {
        prisma.$disconnect();
    }
}