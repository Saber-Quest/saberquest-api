import * as fs from "fs";

export async function createBuffer(url: string): Promise<Buffer> {
    const response = await fetch(url);
    const blob = await response.blob();
    const arrayBuffer = await blob.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    return buffer;
}

export function createImageBuffer(base64: string): Buffer {
    const buffer = Buffer.from(base64, "base64");
    return buffer;
}

export function downloadAvatar(buffer: Buffer, id: string): void {
    fs.writeFileSync(`./data/avatars/${id}.png`, buffer);
}

export function downloadBanner(buffer: Buffer, id: string, type: string): void {
    fs.writeFileSync(`./data/banners/${type}/${id}.png`, buffer);
}

export async function compareAvatars(url: string, id: string): Promise<void> {
    const buffer = await createBuffer(url);
    let exists: boolean;
    exists = fs.existsSync(`./data/avatars/${id}.png`);
    if (!exists) {
        downloadAvatar(buffer, id);
        return;
    }
    let file: Buffer;
    file = fs.readFileSync(`./data/avatars/${id}.png`);
    if (file.toString() !== buffer.toString()) {
        downloadAvatar(buffer, id);
    }
}

export function getAvatar(id: string): Buffer | null {
    try {
        return fs.readFileSync(`./data/avatars/${id}.png`);
    } catch (e) {
        return null;
    }
}

export async function getBanner(id: string, type: string): Promise<Buffer> {
    try {
        return fs.readFileSync(`./data/banners/${type}/${id}.png`);
    } catch (e) {
        return await createBuffer(`${process.env.FRONTEND_URL}/assets/images/users/banners/${type}/default.png`);
    }
}