import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
    const challenges = [
        { type: "pp", name: "PP Challenge", description: "Get a certain amount of PP on a single map." },
        { type: "map", name: "Play X Maps Challenge", description: "Play a certain amount of maps." },
        { type: "fcnotes", name: "FC Notes Challenge", description: "FC a map with a certain amount of notes." },
        { type: "passnotes", name: "Pass Notes Challenge", description: "Pass a map with a certain amount of notes." },
        { type: "fcstars", name: "FC Stars Challenge", description: "FC a map with a certain amount of stars." },
        { type: "xaccuracystars", name: "X Accuracy Stars Challenge", description: "Get a certain amount of accuracy on a map with a certain amount of stars." },
        { type: "xaccuracypp", name: "X Accuracy PP Challenge", description: "Get a certain amount of accuracy on a map while gaining a certain amount of pp." },
        { type: "xaccuracynotes", name: "X Accuracy Notes Challenge", description: "Get a certain amount of accuracy on a map with a certain amount of notes." }
    ];

    const challengeSets: any = {};
    for (const challenge of challenges) {
        challengeSets[challenge.type] = await prisma.challengeSet.upsert({
            where: { type: challenge.type },
            update: {},
            create: challenge,
        });
    }

    const difficulties = [
        { challengeId: challengeSets.pp.id, values: [50, 70], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.pp.id, values: [200, 250], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.pp.id, values: [400, 500], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.map.id, values: [3], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.map.id, values: [8], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.map.id, values: [15], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.fcnotes.id, values: [200], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.fcnotes.id, values: [700], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.fcnotes.id, values: [1500], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.passnotes.id, values: [350], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.passnotes.id, values: [1000], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.passnotes.id, values: [2500], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.fcstars.id, values: [2, 2.5], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.fcstars.id, values: [5, 6.5], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.fcstars.id, values: [8.5, 10], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.xaccuracystars.id, values: [2, 2.5, 90], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.xaccuracystars.id, values: [5, 6.5, 92], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.xaccuracystars.id, values: [8.5, 10, 94], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.xaccuracypp.id, values: [100, 150, 90], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.xaccuracypp.id, values: [300, 350, 92], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.xaccuracypp.id, values: [400, 500, 94], difficulty: 3, color: "#B74BF5" },

        { challengeId: challengeSets.xaccuracynotes.id, values: [600, 75], difficulty: 1, color: "#FFD941" },
        { challengeId: challengeSets.xaccuracynotes.id, values: [1000, 85], difficulty: 2, color: "#E93B3B" },
        { challengeId: challengeSets.xaccuracynotes.id, values: [2000, 94], difficulty: 3, color: "#B74BF5" },
    ];

    // @ts-ignore
    await prisma.difficulty.createMany({ data: difficulties });

    await prisma.item.createMany({
        data: [
            { id: "ap", name: "Arrow Pieces", value: 1, image: "https://saberquest.xyz/assets/images/icons/arrow_pieces_icon.png", rarity: 1, price: 5 },
            { id: "bcn", name: "Bad Cut Notes", value: 1, image: "https://saberquest.xyz/assets/images/icons/badcut_notes_icon.png", rarity: 1, price: 0 },
            { id: "bp", name: "Blue Note Pieces", value: 1, image: "https://saberquest.xyz/assets/images/icons/blue_cube_pieces_icon.png", rarity: 1, price: 5 },
            { id: "bd", name: "Blue Debris", value: 3, image: "https://saberquest.xyz/assets/images/icons/blue_debris_icon.png", rarity: 2, price: 20 },
            { id: "bn", name: "Blue Notes", value: 4, image: "https://saberquest.xyz/assets/images/icons/blue_notes_icon.png", rarity: 1, price: 15 },
            { id: "bs", name: "Blue Saber", value: 0, image: "https://saberquest.xyz/assets/images/icons/blue_saber_icon.png", rarity: 3, price: 40 },
            { id: "b", name: "Bombs", value: 5, image: "https://saberquest.xyz/assets/images/icons/bombs_icon.png", rarity: 2, price: 10 },
            { id: "bt", name: "BSMG Token", value: 35, image: "https://saberquest.xyz/assets/images/icons/bsmg_token.png", rarity: 5, price: 0 },
            { id: "ht", name: "Hitbloq Token", value: 35, image: "https://saberquest.xyz/assets/images/icons/hitbloq_token.png", rarity: 5, price: 0 },
            { id: "cw", name: "Crouch Wall", value: 8, image: "https://saberquest.xyz/assets/images/icons/crouch_wall_icon.png", rarity: 3, price: 0 },
            { id: "ct", name: "CC Token", value: 35, image: "https://saberquest.xyz/assets/images/icons/cube_community_token.png", rarity: 5, price: 0 },
            { id: "gn", name: "Golden Note", value: 45, image: "https://saberquest.xyz/assets/images/icons/golden_note_icon.png", rarity: 5, price: 0 },
            { id: "gp", name: "Golden Pieces", value: 3, image: "https://saberquest.xyz/assets/images/icons/golden_pieces_icon.png", rarity: 5, price: 100 },
            { id: "rcp", name: "Red Note Pieces", value: 1, image: "https://saberquest.xyz/assets/images/icons/red_cube_pieces_icon.png", rarity: 1, price: 5 },
            { id: "rd", name: "Red Debris", value: 8, image: "https://saberquest.xyz/assets/images/icons/red_debris_icon.png", rarity: 2, price: 20 },
            { id: "rn", name: "Red Notes", value: 4, image: "https://saberquest.xyz/assets/images/icons/red_notes_icon.png", rarity: 1, price: 15 },
            { id: "rs", name: "Red Saber", value: 0, image: "https://saberquest.xyz/assets/images/icons/red_saber_icon.png", rarity: 3, price: 40 },
            { id: "st", name: "ScoreSaber Token", value: 35, image: "https://saberquest.xyz/assets/images/icons/scoresaber_token.png", rarity: 5, price: 0 },
            { id: "sn", name: "Silver Note", value: 25, image: "https://saberquest.xyz/assets/images/icons/silver_note_icon.png", rarity: 4, price: 0 },
            { id: "sp", name: "Silver Pieces", value: 5, image: "https://saberquest.xyz/assets/images/icons/silver_pieces_icon.png", rarity: 4, price: 80 },
            { id: "w", name: "Wall", value: 5, image: "https://saberquest.xyz/assets/images/icons/wall_icon.png", rarity: 3, price: 0 },
            { id: "115", name: "115", value: 7, image: "https://saberquest.xyz/assets/images/icons/115.png", rarity: 5, price: 0 },
            { id: "bpp", name: "Blue Poodle", value: 50, image: "https://saberquest.xyz/assets/images/icons/blue_poodle_icon.png", rarity: 4, price: 120 },
            { id: "bsl", name: "Blue Slider", value: 20, image: "https://saberquest.xyz/assets/images/icons/blue_slider_icon.png", rarity: 3, price: 60 },
            { id: "bst", name: "Blue Stack", value: 10, image: "https://saberquest.xyz/assets/images/icons/blue_stack.png", rarity: 3, price: 30 },
            { id: "bto", name: "Blue Tower", value: 16, image: "https://saberquest.xyz/assets/images/icons/blue_tower.png", rarity: 4, price: 45 },
            { id: "br", name: "Bomb Reset", value: 30, image: "https://saberquest.xyz/assets/images/icons/bomb_reset_icon.png", rarity: 3, price: 50 },
            { id: "dn", name: "Double Notes", value: 12, image: "https://saberquest.xyz/assets/images/icons/double_notes_icon.png", rarity: 2, price: 30 },
            { id: "rpp", name: "Red Poodle", value: 50, image: "https://saberquest.xyz/assets/images/icons/red_poodle_icon.png", rarity: 4, price: 120 },
            { id: "rsl", name: "Red Slider", value: 20, image: "https://saberquest.xyz/assets/images/icons/red_slider_icon.png", rarity: 3, price: 60 },
            { id: "rst", name: "Red Stack", value: 10, image: "https://saberquest.xyz/assets/images/icons/red_stack.png", rarity: 3, price: 30 },
            { id: "rto", name: "Red Tower", value: 16, image: "https://saberquest.xyz/assets/images/icons/red_tower.png", rarity: 4, price: 45 },
        ],
    });

    await prisma.craft.createMany({
        data: [
            { item1Id: "ap", item2Id: "bp", productId: "bn" },
            { item1Id: "ap", item2Id: "rcp", productId: "rn" },
            { item1Id: "ap", item2Id: "bto", productId: "bsl" },
            { item1Id: "ap", item2Id: "rto", productId: "rsl" },
            { item1Id: "bn", item2Id: "rn", productId: "dn" },
            { item1Id: "bn", item2Id: "bn", productId: "bst" },
            { item1Id: "bn", item2Id: "bst", productId: "bto" },
            { item1Id: "bn", item2Id: "bs", productId: "bd" },
            { item1Id: "bn", item2Id: "rs", productId: "bcn" },
            { item1Id: "bn", item2Id: "sp", productId: "sn" },
            { item1Id: "b", item2Id: "dn", productId: "br" },
            { item1Id: "rn", item2Id: "rn", productId: "rst" },
            { item1Id: "rn", item2Id: "rs", productId: "rsl" },
            { item1Id: "rn", item2Id: "bs", productId: "bd" },
            { item1Id: "rn", item2Id: "bn", productId: "bst" },
            { item1Id: "rn", item2Id: "sp", productId: "sn" },
            { item1Id: "gp", item2Id: "sn", productId: "gn" },
            { item1Id: "rsl", item2Id: "rsl", productId: "rpp" },
            { item1Id: "bsl", item2Id: "bsl", productId: "bpp" },
        ],
    });
}


main()
    .catch((e) => {
        console.error("❌ Error seeding database:", e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });