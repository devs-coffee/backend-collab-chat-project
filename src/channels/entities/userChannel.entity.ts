import { UserChannel } from '@prisma/client';
import { UserEntity } from '../../users/entities/user.entity';

export class UserChannelEntity implements UserChannel {
    id: string;
    userId: string;
    channelId: string;
    createdAt: Date;
    updatedAt: Date;
}
