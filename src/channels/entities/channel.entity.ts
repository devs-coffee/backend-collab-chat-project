import { Channel, Message, Server, User, UserChannel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserEntity } from '../../users/entities/user.entity';
import { UserChannelEntity } from './userChannel.entity';

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
    users?: UserChannelEntity[]
}
