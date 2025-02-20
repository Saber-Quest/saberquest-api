import { randomBytes } from "crypto";

function generateState(length = 32) {
    return randomBytes(length).toString("hex");
}

export { generateState };