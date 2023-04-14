import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class ServerDto {
    @AutoMap()
    @ApiProperty()
    id?: string;

    @AutoMap()
    @ApiProperty()
    name: string;

    @AutoMap()
    @ApiProperty()
    picture?: string;

    @AutoMap()
    @ApiProperty()
    categories: string[];

    @AutoMap()
    isPrivate: boolean;

    userId: string;

    @AutoMap()
    isCurrentUserAdmin: boolean = false;
}
