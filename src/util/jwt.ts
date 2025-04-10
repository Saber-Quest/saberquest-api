import { sign, verify } from "jsonwebtoken";

function signToken(id: string, username: string) {
    return sign({ id, username }, process.env.JWT_SECRET as string);
}

interface Token {
    id: string,
    username: string,
    iat: number,
    exp: number
}

function verifyToken(token: string): Token | null {
    try {
        return verify(token, process.env.JWT_SECRET as string) as Token;
    } catch {
        return null;
    }
}

export { signToken, verifyToken };