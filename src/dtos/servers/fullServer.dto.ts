import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { ServerDto } from './server.dto';

export class FullServerDto extends ServerDto {
    @AutoMap()
    @ApiProperty()
    channels: ChannelEntity[]

    @AutoMap()
    isPrivate: boolean;

    userId: string;

    @AutoMap()
    isCurrentUserAdmin: boolean = false;

    isCurrentUserMember: boolean = false;
}