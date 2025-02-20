import { ApiProperty } from "@nestjs/swagger";

export class UpdateUserAdmin {
    @ApiProperty()
    user: string;
    @ApiProperty()
    property: string;
    @ApiProperty()
    value: string;
}