import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { PrefsDto } from './prefs.dto';

export class UserDto {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    pseudo: string;

    @AutoMap()
    @ApiPropertyOptional()
    picture?: string;

    @AutoMap()
    prefs?: PrefsDto
}