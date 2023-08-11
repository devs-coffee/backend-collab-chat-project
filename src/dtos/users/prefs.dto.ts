import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";
import { ColorScheme } from "@prisma/client";

export class PrefsDto {
    @ApiProperty()
    @AutoMap()
    colorScheme: ColorScheme;
}