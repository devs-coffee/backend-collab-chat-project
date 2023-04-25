import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { ChannelEntity } from 'src/channels/entities/channel.entity';

export class FullServerDto {
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
    @ApiProperty()
    channels: ChannelEntity[]

    @AutoMap()
    isPrivate: boolean;

    userId: string;

    @AutoMap()
    isCurrentUserAdmin: boolean = false;
}
