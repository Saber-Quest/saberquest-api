import { BeatLeader } from 'yabsl';
import * as checkers from './checkers';
import { Checker } from '../checker';

export async function beatLeader(type: Checker, challenge: number[], id: string) {
    const today = new Date().setUTCHours(0, 0, 0, 0);
    const todayUnix = Math.floor(today / 1000);

    const response = await BeatLeader.scores.get(id, {
        page: 1,
        count: 50
    });

    return await checkers[type](challenge, todayUnix, response);
}