import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { AutomapperModule } from '@automapper/nestjs';

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
    isPrivate: boolean;

    userId: string;
}
