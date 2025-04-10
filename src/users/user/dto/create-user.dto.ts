import { ApiProperty } from "@nestjs/swagger"

export class CreateUser {
    @ApiProperty()
    id: string;
    @ApiProperty()
    username: string;
    @ApiProperty()
    preference: number;
    @ApiProperty()
    privateKey: string;
}