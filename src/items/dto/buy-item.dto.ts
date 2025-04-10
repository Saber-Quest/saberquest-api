import { ApiProperty } from "@nestjs/swagger";

export class BuyItem {
    @ApiProperty()
    item: string;
}