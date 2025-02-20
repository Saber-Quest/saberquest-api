import { BadRequestException, Body, Controller, Get, Headers, Param, Post, Query, Put, HttpCode } from "@nestjs/common";
import { UserService } from "./user.service";
import { CreateUser } from "./dto/create-user.dto";
import { UpdateUser } from "./dto/update-user.dto";
import { ApiBearerAuth, ApiOperation, ApiQuery, ApiResponse, ApiSecurity } from "@nestjs/swagger";

enum SortEnum {
    rank = "rank",
    qp = "qp"
}

enum OrderEnum {
    asc = "asc",
    desc = "desc"
}

@Controller("users")
export class UserController {
    constructor(private readonly userService: UserService) { }

    @Get()
    @ApiOperation({ summary: 'Get users according to parameters.' })
    @ApiQuery({ name: "page", type: "number" })
    @ApiQuery({ name: "size", type: "number" })
    @ApiQuery({ name: "sort", enum: SortEnum, required: false })
    @ApiQuery({ name: "order", enum: OrderEnum, required: false })
    @ApiQuery({ name: "search", type: "string", required: false })
    getUsers(
        @Query('page') page: string,
        @Query('size') size: string,
        @Query('sort') sort?: SortEnum,
        @Query('order') order?: OrderEnum,
        @Query('search') search?: string
    ) {
        const pageNum = Number(page);
        const pageSize = Number(size);
        if (isNaN(pageNum) || isNaN(pageSize) || pageSize < 0 || pageSize > 100 || pageNum < 0) throw new BadRequestException("Invalid query parameters.")
        return this.userService.getUsers(pageNum, pageSize, sort, order, search);
    }

    @Post()
    @HttpCode(201)
    @ApiOperation({ summary: 'Create a user.' })
    @ApiSecurity('Private')
    @ApiResponse({ status: 201, description: 'User created.' })
    @ApiResponse({ status: 400, description: 'Invalid request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    createUser(@Body() body: CreateUser) {
        return this.userService.createUser(body);
    }

    @Get(":id")
    @ApiOperation({ summary: 'Get a user.' })
    @ApiResponse({ status: 200, description: 'User.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    getUser(@Param('id') id: string) {
        return this.userService.getUser(id);
    }

    @Get(":id/all")
    @ApiOperation({ summary: 'Get extended information about a user.' })
    @ApiResponse({ status: 200, description: 'User.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    getUserAll(@Param('id') id: string) {
        return this.userService.getUserAll(id);
    }

    @Get(":id/challenges")
    @ApiOperation({ summary: 'Get the challenge history of a user.' })
    @ApiQuery({ name: 'page', type: 'number' })
    @ApiQuery({ name: 'size', type: 'number' })
    @ApiResponse({ status: 200, description: 'Challenge history.' })
    @ApiResponse({ status: 400, description: 'Invalid query parameters.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    getUserChallenges(
        @Param('id') id: string,
        @Query('page') page: string,
        @Query('size') size: string
    ) {
        const pageNum = Number(page);
        const pageSize = Number(size);
        if (isNaN(pageNum) || isNaN(pageSize) || pageSize < 0 || pageSize > 100 || pageNum < 0) throw new BadRequestException("Invalid query parameters.")
        return this.userService.getChallengeHisotry(id, pageNum, pageSize);
    }

    @Get(":id/items")
    @ApiOperation({ summary: 'Get the items of a user.' })
    @ApiResponse({ status: 200, description: 'Items.' })
    @ApiResponse({ status: 404, description: 'User not found.' })
    getUserItems(@Param('id') id: string) {
        return this.userService.getItems(id);
    }

    @Put("update")
    @HttpCode(201)
    @ApiOperation({ summary: 'Update a user.' })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'User updated.' })
    @ApiResponse({ status: 400, description: 'Invalid request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    updateUser(
        @Body() body: UpdateUser,
        @Headers('Authorization') auth: string
    ) {
        return this.userService.update(body, auth);
    }

    @Post(":id/complete")
    @ApiOperation({ summary: 'Complete a challenge.' })
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Challenge completed.' })
    @ApiResponse({ status: 400, description: 'Invalid request.' })
    @ApiResponse({ status: 401, description: 'Unauthorized request.' })
    @ApiResponse({ status: 404, description: 'Challenge not found.' })
    completeChallenge(
        @Headers('Authorization') auth: string,
        @Param('id') id: string,
    ) {
        return this.userService.completeChallenge(id, auth);
    }
}