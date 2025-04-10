import { Controller, Get, Put, Body, Headers, HttpCode, Post, Query } from '@nestjs/common';
import { ItemsService } from './items.service';
import { AddItem } from './dto/add-item.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { CraftItem } from './dto/craft-item.dto';
import { BuyItem } from './dto/buy-item.dto';

@Controller('items')
export class ItemsController {
    constructor(private readonly itemsService: ItemsService) { }

    @Get()
    @ApiOperation({ summary: 'Get all available items in database.' })
    @ApiResponse({ status: 200, description: 'All available items.' })
    getAll() {
        return this.itemsService.getAllItems();
    }

    @Get("recipes")
    @ApiOperation({ summary: 'Get all the available recipes for crafting.' })
    @ApiResponse({ status: 200, description: 'All available recipes.' })
    getRecipes() {
        return this.itemsService.recipes();
    }

    @Put()
    @HttpCode(201)
    @ApiOperation({ summary: 'Add item to user as an admin.' })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Item successfully added.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    addItem(
        @Body() body: AddItem
    ) {
        return this.itemsService.addItem(body);
    }

    @Post()
    @HttpCode(201)
    @ApiOperation({ summary: 'Buy an item from the shop.' })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Item successfully bought.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    buyItem(
        @Body() body: BuyItem,
        @Headers('Authorization') auth: string
    ) {
        return this.itemsService.buyItem(body.item, auth);
    }


    @Put("craft")
    @HttpCode(201)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Used for doing the crafting operation.' })
    @ApiResponse({ status: 201, description: 'Item successfully crafted.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    @ApiResponse({ status: 500, description: 'Internal server error.' })
    craftItem(
        @Body() body: CraftItem,
        @Headers('Authorization') auth: string
    ) {
        return this.itemsService.craft(body, auth);
    }

    @Get("shop")
    @ApiOperation({ summary: 'Get the items available in the shop.' })
    @ApiResponse({ status: 200, description: 'Items available in the shop.' })
    getShop() {
        return this.itemsService.shop();
    }
}
