import { Body, Controller, Delete, Headers, HttpCode, Put, Query } from '@nestjs/common';
import { AdminService } from './admin.service';
import { UpdateUserAdmin } from './dto/update-user.dto';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

@Controller('admin')
export class AdminController {
    constructor (private readonly adminService: AdminService) {}

    @Put("update")
    @HttpCode(201)
    @ApiOperation({ summary: "Used for updating the user forcibly. " })
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: "User changed." })
    @ApiResponse({ status: 401, description: "Unauthorized request." })
    @ApiResponse({ status: 403, description: "Forbidden." })
    updateUser(
        @Body() body: UpdateUserAdmin,
        @Headers('Authorization') auth: string
    ) {
        return this.adminService.updateUser(auth, body);
    }

    @Delete("remove")
    @ApiOperation({ summary: "Used to delete a user from the database. "})
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: "User deleted." })
    @ApiResponse({ status: 401, description: "Unauthorized request." })
    @ApiResponse({ status: 403, description: "Forbidden." })
    deleteUser(
        @Query('user') user: string,
        @Headers('Authorization') auth: string
    ) {
        return this.adminService.deleteUser(auth, user);
    }
}
