import { Injectable, UnauthorizedException, NotFoundException} from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { createBuffer, downloadAvatar } from 'src/util/images';
import { Request, Response } from 'express';
import { signToken } from 'src/util/jwt';
import { generateState } from 'src/util/state';

@Injectable()
export class LoginService {
    constructor (private readonly prisma: PrismaService) {}
    callbacks: { identifier: string, callback: string }[] = [];
    activeRequests: string[] = [];

    async login(id: string, state: string, res: Response) {
        const userState = this.activeRequests.filter(s => s == state)[0];

        if (!userState) throw new UnauthorizedException();

        this.activeRequests.splice(this.activeRequests.indexOf(userState), 1);

        const callback = this.callbacks.filter(c => c.identifier == state)[0];

        if (!callback) throw new UnauthorizedException();

        this.callbacks.splice(this.callbacks.indexOf(callback), 1);

        const user = await this.prisma.user.findFirst({ where: { id } });

        if (!user) {
            let username: string;
            let avatar: string;
            let preference: number;

            const bl = await fetch(`https://api.beatleader.xyz/player/${id}`).then(res => res.json());

            if (bl.id !== null) {
                preference = 1;
                avatar = bl.avatar;
                username = bl.name
            }
            else {
                const ss = await fetch(`https://scoresaber.com/api/player/${id}/basic`).then(res => res.json());
                if (!ss.errorMessage) {
                    preference = 2;
                    avatar = ss.profilePicture;
                    username = ss.name;
                } else {
                    throw new NotFoundException("User does not exist on BeatLeader and ScoreSaber.");
                }
            }

            const buffer = await createBuffer(avatar);
            downloadAvatar(buffer, id);

            const newUser = await fetch(`${process.env.REDIRECT_URI_API}/users`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    id: id,
                    username: username,
                    preference: preference,
                    privateKey: process.env.PRIVATE_KEY as string
                })
            }).then(res => res.json())

            res.redirect(`${callback.callback}?token=${signToken(id, newUser.username)}&id=${newUser.id}`);
        } else {
            res.redirect(`${callback.callback}?token=${signToken(id, user.username)}&id=${user.id}`);
        }
    }

    async loginBeatleader(code: string, iss: string, callback: string, req: Request, res: Response) {
        if (typeof code != "string") {
            const identifier = String(req.ip || req.headers["x-forwarded-for"]);
            this.callbacks.push({ identifier, callback });
            this.activeRequests.push(identifier);
            res.redirect(`https://api.beatleader.xyz/oauth2/authorize?client_id=${process.env.BEATLEADER_ID}&response_type=code&redirect_uri=${process.env.REDIRECT_URI_API}/login/beatleader&scope=profile`);
        }
    }

    loginSteam(state: string, callback: string, steamIdentity: string, req: Request, res: Response) {
        if (typeof state != "string") {
            const identifier = generateState();
            this.callbacks.push({ identifier, callback });
            this.activeRequests.push(identifier);
            res.redirect(`https://steamcommunity.com/openid/login?openid.ns=http://specs.openid.net/auth/2.0&openid.mode=checkid_setup&openid.claimed_id=http://specs.openid.net/auth/2.0/identifier_select&openid.identity=http://specs.openid.net/auth/2.0/identifier_select&openid.return_to=${process.env.REDIRECT_URI_API}/login/steam?state=${identifier}&openid.realm=${process.env.REDIRECT_URI_API}`)
        }

        const userState = this.callbacks.filter(c => c.identifier == state)[0];

        if (!userState) throw new UnauthorizedException();

        const id = steamIdentity.toString().split("/").pop();

        setTimeout(() => {
            const index = this.activeRequests.indexOf(userState.identifier);
            if (index > -1) this.activeRequests.splice(index, 1);
        }, 1000 * 15)

        res.redirect(`${process.env.REDIRECT_URI_API}/login?id=${id}&state=${userState.identifier}`);
    }
}
