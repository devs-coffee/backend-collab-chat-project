import { Channel, Message, Server, User, UserChannel } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserEntity } from '../../users/entities/user.entity';

export class UserChannelEntity implements UserChannel {
    id: string;
    userId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
    user?: UserEntity
}
