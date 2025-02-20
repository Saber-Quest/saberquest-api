import { BLScores } from "yabsl/src/beatleader/scores";
import { BeatSaver } from "yabsl";

// ------------------------------------- PP -------------------------------------

export async function pp(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        if (parseInt(score.timeset) >= todayUnix && score.pp >= challenge[1]) {
            return true;
        }
    }

    return false;
}

// ------------------------------------- MAP -------------------------------------

export async function map(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    let maps = 0;
    scores.data.forEach((score) => {
        if (parseInt(score.timeset) >= todayUnix) {
            maps++;
        }
    });

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- FCNOTES -------------------------------------

export async function fcnotes(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (parseInt(score.timeset) >= todayUnix) {
            if (score.fullCombo) {
                const map = await BeatSaver.maps.hash(score.leaderboard.song.hash);

                for (const diff of map.versions[0].diffs) {
                    if (diff.difficulty === score.leaderboard.difficulty.difficultyName) {
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

export async function passnotes(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        await new Promise((resolve) => setTimeout(resolve, 10));
        if (parseInt(score.timeset) >= todayUnix) {
            const map = await BeatSaver.maps.hash(score.leaderboard.song.hash);

            for (const diff of map.versions[0].diffs) {
                if (diff.difficulty === score.leaderboard.difficulty.difficultyName) {
                    if (diff.notes >= challenge[0]) {
                        return true;
                    }
                }
            }
        }
    }

    return false;
}

// ------------------------------------- FCSTARS -------------------------------------

export async function fcstars(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        if (parseInt(score.timeset) >= todayUnix) {
            if (score.fullCombo && score.leaderboard.difficulty.stars >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYSTARS -------------------------------------

export async function xaccuracystars(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        if (parseInt(score.timeset) >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[2] && score.leaderboard.difficulty.stars >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYPP -------------------------------------

export async function xaccuracypp(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        if (parseInt(score.timeset) >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[2] && score.pp >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYNOTES -------------------------------------

export async function xaccuracynotes(challenge: number[], todayUnix: number, scores: BLScores): Promise<boolean> {
    for (const score of scores.data) {
        if (parseInt(score.timeset) >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[1]) {
                const map = await BeatSaver.maps.hash(score.leaderboard.song.hash);

                for (const diff of map.versions[0].diffs) {
                    if (diff.difficulty === score.leaderboard.difficulty.difficultyName) {
                        if (diff.notes >= challenge[0]) {
                            return true;
                        }
                    }
                }
            }
        }
    }

    return false;
}