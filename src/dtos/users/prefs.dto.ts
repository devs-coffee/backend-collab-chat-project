import { AutoMap } from "@automapper/classes";
import { ApiProperty } from "@nestjs/swagger";

export class PrefsDto {
    @ApiProperty()
    colorScheme: string;

    userId?: string;
}