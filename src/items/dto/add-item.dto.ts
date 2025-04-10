import { ApiProperty } from "@nestjs/swagger";

export class AddItem {
    @ApiProperty()
    userId: string;
    @ApiProperty()
    itemId: string;
    @ApiProperty()
    amount: number;
    @ApiProperty()
    authorizationCode: string;
}