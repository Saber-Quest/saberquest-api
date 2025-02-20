import { ApiProperty } from "@nestjs/swagger";

export class UpdateUser {
    @ApiProperty()
    property: "about" | "username" | "avatar" | "border" | "banner" | "preference" | "autoComplete" | "diff";
    @ApiProperty()
    value: number | string | boolean
    @ApiProperty()
    image?: string
    @ApiProperty()
    type?: "hor" | "ver"
}