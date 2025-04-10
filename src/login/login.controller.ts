import { Controller, Get, Query, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { LoginService } from './login.service';

@Controller("login")
export class LoginController {
    constructor (private readonly loginService: LoginService) {}

    @Get()
    async login(
        @Query('id') id: string,
        @Query('state') state: string,
        @Res() res: Response
    ) {
        return this.loginService.login(id, state, res);
    }

    @Get("steam")
    async loginSteam(
        @Query('state') state: string,
        @Query('callback') callback: string,
        @Query('openid.identity') steamIdentity: string,
        @Res() res: Response
    ) {
        return this.loginService.loginSteam(state, callback, steamIdentity, res);
    }

    @Get("beatleader")
    async loginBeatleader(
        @Query('code') code: string,
        @Query('callback') callback: string,
        @Query('iss') iss: string,
        @Query('state') state: string,
        @Res() res: Response
    ) {
        return this.loginService.loginBeatleader(code, iss, callback, res, state);
    }
}