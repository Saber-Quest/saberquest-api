import { ScoreSaber } from "yabsl";
import { Checker } from "../checker";
import * as checkers from "./checkers";

export async function scoreSaber(type: Checker, challenge: number[], id: string) {
    const today = new Date().setUTCHours(0, 0, 0, 0);
    const todayBl = Math.floor(today / 1000);

    const response = await ScoreSaber.players.scores(id, "recent", 1, 50);

    return checkers[type](challenge, todayBl, response);
}