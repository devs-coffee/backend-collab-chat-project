import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserChannelDto } from './channel.user.dto';
import { ServerDto } from '../servers/server.dto';
import { ChannelDto } from './channel.dto';

export class ChannelServerDto {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    name: string;

    @AutoMap()
    @ApiProperty({ required: false, nullable: true})
    picture: string;

    @AutoMap()
    @ApiProperty()
    channels?: ChannelDto[];
}
