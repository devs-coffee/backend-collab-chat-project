import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UserServerDto {
    @ApiProperty()
    id: string;

    @ApiProperty()
    @AutoMap()
    userId: string;

    @ApiProperty()
    @AutoMap()
    isAdmin: boolean;

    @ApiProperty()
    @AutoMap()
    serverId: string;
}
