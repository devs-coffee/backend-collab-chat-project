import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Channel } from '@prisma/client';
import { UserPrivateChannelEntity } from './userPrivateChannel.entity';

export class ChannelEntity implements Channel {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    title: string;

    @AutoMap()
    @ApiProperty()
    serverId: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @AutoMap()
    users?: UserPrivateChannelEntity[]
}
