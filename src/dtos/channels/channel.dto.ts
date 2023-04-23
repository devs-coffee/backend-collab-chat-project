import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserChannelDto } from '../userChannels/user-channel-dto';

export class ChannelDto {
    @AutoMap()
    @ApiProperty()
    id?: string;

    @AutoMap()
    @ApiProperty()
    title: string;

    @AutoMap()
    @ApiProperty()
    serverId: string;

    @AutoMap()
    @ApiProperty()
    users?: UserChannelDto[]
}
