import { BLScores } from "yabsl/src/beatleader/scores";
import { BeatSaver } from "yabsl";

// ------------------------------------- PP -------------------------------------

export function pp(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix && score.pp >= challenge[1]) {
            return true;
        }
    }

    return false;
}

// ------------------------------------- MAP -------------------------------------

export function map(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    let maps = 0;
    scores.data.forEach((score) => {
        if (score.timepost >= todayUnix) {
            maps++;
        }
    });

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- FCNOTES -------------------------------------

export function fcnotes(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if (score.fullCombo) {
                if (score.leaderboard.difficulty.notes >= challenge[1]) {
                    return true;
                }
            }
        }
    }

    return false;
}

// ------------------------------------- PASSNOTES -------------------------------------

export function passnotes(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if (score.leaderboard.difficulty.notes >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- FCSTARS -------------------------------------

export function fcstars(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if (score.fullCombo && score.leaderboard.difficulty.stars >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYSTARS -------------------------------------

export function xaccuracystars(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[2] && score.leaderboard.difficulty.stars >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYPP -------------------------------------

export function xaccuracypp(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[2] && score.pp >= challenge[1]) {
                return true;
            }
        }
    }

    return false;
}

// ------------------------------------- XACCURACYNOTES -------------------------------------

export function xaccuracynotes(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[1]) {
                if (score.leaderboard.difficulty.notes >= challenge[0]) {
                    return true;
                }
            }
        }
    }

    return false;
}

// ------------------------------------- FCXMAPS -------------------------------------

export function fcxmaps(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    let maps = 0;

    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if (score.fullCombo) maps++
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- XACCURACYXMAPS -------------------------------------

export function xaccuracyxmaps(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    let maps = 0;

    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            if ((score.accuracy * 100) >= challenge[1]) {
                if (score.leaderboard.difficulty.notes >= challenge[2]) {
                    maps++;
                }
            }
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}

// ------------------------------------- XMINUTEXMAPS -------------------------------------

export function xminutexmaps(challenge: number[], todayUnix: number, scores: BLScores): boolean {
    let maps = 0;

    for (const score of scores.data) {
        if (score.timepost >= todayUnix) {
            score.leaderboard.song.difficulties[0].notes
            if (score.leaderboard.song.duration >= challenge[1]) {
                maps++;
            }
        }
    }

    if (maps >= challenge[0]) {
        return true;
    }

    return false;
}