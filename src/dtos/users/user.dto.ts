import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

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
}