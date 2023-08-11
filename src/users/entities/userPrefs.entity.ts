import { UserPrefs, ColorScheme } from "@prisma/client";
import { ApiProperty } from "@nestjs/swagger";
import { AutoMap } from "@automapper/classes";

export class UserPrefsEntity implements UserPrefs {
    id: string;

    userId: string;
    
    @AutoMap()
    @ApiProperty()
    colorScheme: ColorScheme
}