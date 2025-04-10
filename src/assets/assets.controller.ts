import { Controller, Get, Param, Query, Res } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Response } from 'express';
import { ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('assets')
export class AssetsController {
    constructor(private readonly assetsService: AssetsService) { }

    @Get(":id/avatar")
    @ApiOperation({ summary: 'Get the avatar of the user.' })
    @ApiResponse({ status: 200, description: 'Avatar of the user.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    getAvatar(
        @Param('id') id: string,
        @Res() res: Response
    ) {
        const image = this.assetsService.profilePicture(id);
        
        res.setHeader('Content-Type', 'image/png');
        res.setHeader("Content-Length", image.length);
        res.send(image);
    }

    @Get(":id/banner")
    @ApiOperation({ summary: 'Get the banner of the user.' })
    @ApiResponse({ status: 200, description: 'Banner of the user.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    async getBanner(
        @Param('id') id: string,
        @Query('type') type: string,
        @Res() res: Response
    ) {
        const image = await this.assetsService.banner(id, type);

        res.setHeader('Content-Type', 'image/png');
        res.setHeader("Content-Length", image.length);
        res.send(image);
    }
}
