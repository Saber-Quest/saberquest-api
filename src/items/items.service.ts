import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, Logger } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { AddItem } from './dto/add-item.dto';
import { CraftItem } from './dto/craft-item.dto';
import { verifyToken } from 'src/util/jwt';
import { Cron } from '@nestjs/schedule';
import { Item } from '@prisma/client';
import { calculateValue } from 'src/util/calculateValue';

enum Rarity {
    Common = 1,
    Uncommon = 2,
    Rare = 3,
    Epic = 4,
    Legendary = 5
}

@Injectable()
export class ItemsService {
    private readonly logger = new Logger(ItemsService.name);
    constructor(private readonly prisma: PrismaService) { }

    async getAllItems() {
        return (await this.prisma.item.findMany()).map(i => {
            return {
                id: i.id,
                image: i.image,
                name: i.name,
                value: i.value,
                rarity: i.rarity,
                price: i.price
            }
        });
    }

    async addItem(body: AddItem) {
        if (body.authorizationCode !== process.env.PRIVATE_KEY as string) throw new UnauthorizedException();
        try {
            const result = await this.prisma.ownership.updateMany({
                where: {
                    userId: body.userId,
                    itemId: body.itemId
                },
                data: {
                    amount: {
                        increment: body.amount
                    }
                }
            });

            if (result.count == 0) {
                await this.prisma.ownership.create({
                    data: {
                        userId: body.userId,
                        itemId: body.itemId,
                        amount: body.amount
                    }
                });
            }

            return;
        } catch (e) {
            throw new InternalServerErrorException();
        }
    }

    async craft(body: CraftItem, token: string) {
        const user = verifyToken(token.split(" ")[1]);

        if (!user || user.exp < Date.now()) throw new UnauthorizedException();

        const craftedItem = await this.prisma.craft.findFirst({
            where: {
                item1Id: body.item1,
                item2Id: body.item2
            }
        });

        if (!craftedItem) throw new NotFoundException();

        if (body.item1 === body.item2) {
            await this.prisma.ownership.updateManyAndReturn({
                where: {
                    userId: user.id,
                    itemId: body.item1
                },
                data: {
                    amount: {
                        decrement: 2
                    }
                }
            }).then(async i => {
                if (i.length < 1 || i[0].amount < 0) {
                    await this.prisma.ownership.updateMany({
                        where: {
                            userId: user.id,
                            itemId: body.item1
                        },
                        data: {
                            amount: {
                                increment: 2
                            }
                        }
                    });

                    throw new BadRequestException("Not enough items in inventory, reverting changes.")
                }
            });
        } else {
            await this.prisma.ownership.updateManyAndReturn({
                where: {
                    userId: user.id,
                    itemId: {
                        in: [body.item1, body.item2]
                    }
                },
                data: {
                    amount: {
                        decrement: 1
                    }
                }
            }).then(async i => {
                if (i.length < 2 || i[0].amount < 0 || i[1].amount < 0) {
                    await this.prisma.ownership.updateMany({
                        where: {
                            userId: user.id,
                            itemId: body.item1 || body.item2
                        },
                        data: {
                            amount: {
                                increment: 1
                            }
                        }
                    });

                    throw new BadRequestException("Not enough items in inventory, reverting changes.")
                }
            });
        }

        const result = await this.prisma.ownership.updateMany({
            where: {
                userId: user.id,
                itemId: craftedItem.productId
            },
            data: {
                amount: {
                    increment: 1
                }
            }
        });

        if (result.count == 0) {
            await this.prisma.ownership.create({
                data: {
                    userId: user.id,
                    itemId: craftedItem.productId,
                    amount: 1
                }
            });
        }

        const value = await calculateValue(user.id);

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                value: value
            }
        });

        return;
    }

    async recipes() {
        return (await this.prisma.craft.findMany({
            include: {
                item1: true,
                item2: true,
                product: true
            }
        })).map(r => {
            return {
                input1: {
                    id: r.item1Id,
                    name: r.item1.name,
                    rarity: r.item1.rarity,
                    image: r.item1.image,
                    value: r.item1.value
                },
                input2: {
                    id: r.item2Id,
                    name: r.item2.name,
                    rarity: r.item2.rarity,
                    image: r.item2.image,
                    value: r.item2.value
                },
                output: {
                    id: r.productId,
                    name: r.product.name,
                    rarity: r.product.rarity,
                    image: r.product.image,
                    value: r.product.value
                }
            }
        })
    }

    async shop() {
        return (await this.prisma.shop.findMany({
            include: {
                item: true
            }
        })).map(s => {
            return {
                id: s.itemId,
                name: s.item.name,
                rarity: s.item.rarity,
                image: s.item.image,
                price: s.item.price
            }
        });
    }

    async buyItem(item: string, auth: string) {
        const user = verifyToken(auth.split(" ")[1]);

        if (!user || user.exp < Date.now()) throw new UnauthorizedException();

        const itemData = await this.prisma.item.findFirst({
            where: {
                id: item
            },
        });

        const verified = await this.prisma.user.findFirst({
            where: {
                id: user.id
            },
            include: {
                ownership: {
                    where: {
                        itemId: item
                    }
                }
            }
        });

        if (!itemData || !verified) throw new NotFoundException();

        if (itemData.price === 0) throw new BadRequestException("Item is not for sale.");

        if (verified.qp < itemData.price!) throw new BadRequestException("Not enough QP.");

        if (verified.ownership.filter(o => o.itemId === item).length > 0) {
            await this.prisma.ownership.updateMany({
                where: {
                    userId: user.id,
                    itemId: item
                },
                data: {
                    amount: {
                        increment: 1
                    }
                }
            });
        } else {
            await this.prisma.ownership.create({
                data: {
                    userId: user.id,
                    itemId: item,
                    amount: 1
                }
            });
        }

        const value = await calculateValue(user.id);

        await this.prisma.user.update({
            where: {
                id: user.id
            },
            data: {
                qp: {
                    decrement: itemData.price!
                },
                value: value
            }
        });

        return "Item bought.";
    }

    @Cron("0 * * * *")
    async changeShop() {
        this.logger.log("Updating shop.");

        const date = new Date().setUTCHours(0, 0, 0, 0);
        const currentShop = await this.prisma.shop.findMany();

        if (currentShop[0] != null && date == currentShop[0].date.setUTCHours(0, 0, 0, 0)) {
            return this.logger.log("Not yet.");
        }

        await this.prisma.shop.deleteMany();

        const items = await this.prisma.item.findMany({
            where: {
                price: {
                    not: 0
                }
            }
        });

        if (items.length === 0) {
            return this.logger.log("No items available.");
        }

        const rarityWeights: Record<number, number> = {
            1: 20,
            2: 12,
            3: 4,
            4: 1,
            5: 0.2
        };

        this.logger.log("Creating a weighted pool, the weights are:");
        console.table(Object.entries(rarityWeights).map(([rarity, weight]) => ({
            Rarity: `${Rarity[parseInt(rarity)]}`,
            Weight: weight
        })));

        let weightedPool: Item[] = [];
        items.forEach(item => {
            const weight = rarityWeights[item.rarity] || 1;
            for (let i = 0; i < weight; i++) {
                weightedPool.push(item);
            }
        });

        let chosenItems: Item[] = [];

        for (let i = 0; i < 5 && weightedPool.length > 0; i++) {
            const randomIndex = Math.floor(Math.random() * weightedPool.length);
            const item = weightedPool[randomIndex];

            this.logger.log(`Item ${i + 1} chosen: ${item.name} (Rarity ${item.rarity})`);

            chosenItems.push(item);

            weightedPool = weightedPool.filter(i => i.id !== item.id);
        }

        const hasRareOrBetter = chosenItems.some(i => i.rarity >= 3);
        if (!hasRareOrBetter) {
            if (Math.random() < 0.5) {
                const rareItems = items.filter(i => i.rarity === 3);
                if (rareItems.length > 0) {
                    const randomRare = rareItems[Math.floor(Math.random() * rareItems.length)];

                    const replaceIndex = chosenItems.findIndex(i => i.rarity <= 2);
                    if (replaceIndex !== -1) {
                        this.logger.log(`Replacing ${chosenItems[replaceIndex].name} with Rare item: ${randomRare.name}`);
                        chosenItems[replaceIndex] = randomRare;
                    }
                }
            }
        }

        await this.prisma.shop.createMany({
            data: chosenItems.map(i => ({ itemId: i.id, date: new Date() }))
        });

        this.logger.log("Shop updated.");
    }
}