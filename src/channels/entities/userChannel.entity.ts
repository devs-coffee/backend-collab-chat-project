import { AutoMap } from '@automapper/classes';
import { UserChannel } from '@prisma/client';

export class UserChannelEntity implements UserChannel {
    id: string;
    userId: string;
    channelId: string;
    @AutoMap()
    lastRead: Date;
    createdAt: Date;
    updatedAt: Date;
}
