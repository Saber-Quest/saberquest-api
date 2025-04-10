import { SSPlayerScores } from "yabsl/src/scoresaber/players";
import { BeatSaver } from "yabsl";

// ------------------------------------- PP -------------------------------------

export function pp(challenge: number[], todayUnix: number, scores: SSPlayerScores): boolean {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (data.score.pp >= challenge[0]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- MAP -------------------------------------

export function map(challenge: number[], todayUnix: number, scores: SSPlayerScores): boolean {
    let maps = 0;
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            maps++;
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- FCNOTES -------------------------------------

export async function fcnotes(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (data.score.fullCombo) {
                const map = await BeatSaver.maps.hash(data.leaderboard.songHash);

                for (const diff of map.versions[0].diffs) {
                    if (diff.difficulty === data.leaderboard.difficulty.difficultyRaw.split("_")[1].split("_")[0]) {
                        if (diff.notes >= challenge[0]) {
                            return true;
                        }
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
    }

    return false;
}

// ------------------------------------- PASSNOTES -------------------------------------

export async function passnotes(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            const map = await BeatSaver.maps.hash(data.leaderboard.songHash);

            for (const diff of map.versions[0].diffs) {
                if (diff.difficulty === data.leaderboard.difficulty.difficultyRaw.split("_")[1].split("_")[0]) {
                    if (diff.notes >= challenge[0]) {
                        return true;
                    }
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    return false;
}

// ------------------------------------- FCSTARS -------------------------------------

export function fcstars(challenge: number[], todayUnix: number, scores: SSPlayerScores): boolean {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (data.score.fullCombo && data.leaderboard.stars >= challenge[0]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYSTARS -------------------------------------

export async function xaccuracystars(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (((data.score.baseScore / data.leaderboard.maxScore) * 100) >= challenge[2] && data.leaderboard.stars >= challenge[0]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYPP -------------------------------------

export function xaccuracypp(challenge: number[], todayUnix: number, scores: SSPlayerScores): boolean {
    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (((data.score.baseScore / data.leaderboard.maxScore) * 100) >= challenge[2] && data.score.pp >= challenge[0]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYNOTES -------------------------------------

export async function xaccuracynotes(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    for (const data of scores.playerScores) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (((data.score.baseScore / data.leaderboard.maxScore) * 100) >= challenge[1]) {
                const map = await BeatSaver.maps.hash(data.leaderboard.songHash);

                for (const diff of map.versions[0].diffs) {
                    if (diff.difficulty === data.leaderboard.difficulty.difficultyRaw.split("_")[1].split("_")[0]) {
                        if (diff.notes >= challenge[0]) {
                            return true;
                        }
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
    }

    return false;
}

// ------------------------------------- FCXMAPS -------------------------------------

export function fcxmaps(challenge: number[], todayUnix: number, scores: SSPlayerScores): boolean {
    let maps = 0;

    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (data.score.fullCombo) maps++
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- XACCURACYXMAPS -------------------------------------

export async function xaccuracyxmaps(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    let maps = 0;

    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            if (((data.score.baseScore / data.leaderboard.maxScore) * 100) >= challenge[1]) {
                const map = await BeatSaver.maps.hash(data.leaderboard.songHash);

                for (const diff of map.versions[0].diffs) {
                    if (diff.difficulty === data.leaderboard.difficulty.difficultyRaw.split("_")[1].split("_")[0]) {
                        if (diff.notes >= challenge[2]) {
                            return true;
                        }
                    }
                }

                await new Promise((resolve) => setTimeout(resolve, 50));
            }
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- XMINUTEXMAPS -------------------------------------

export async function xminutexmaps(challenge: number[], todayUnix: number, scores: SSPlayerScores): Promise<boolean> {
    let maps = 0;

    for (const data of scores.playerScores) {
        if (new Date(data.score.timeSet).getTime() >= todayUnix) {
            const map = await BeatSaver.maps.hash(data.leaderboard.songHash);

            for (const diff of map.versions[0].diffs) {
                if (diff.difficulty === data.leaderboard.difficulty.difficultyRaw.split("_")[1].split("_")[0]) {
                    if (diff.length >= challenge[1]) {
                        maps++;
                    }
                }
            }

            await new Promise((resolve) => setTimeout(resolve, 50));
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}