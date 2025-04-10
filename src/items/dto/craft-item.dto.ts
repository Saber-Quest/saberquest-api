import { ApiProperty } from "@nestjs/swagger";

export class CraftItem {
    @ApiProperty()
    item1: string;
    @ApiProperty()
    item2: string;
}