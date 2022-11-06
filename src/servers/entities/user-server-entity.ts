import { UserServer } from '@prisma/client';

export class UserServerEntity implements UserServer {
    id: string;
    userId: string;
    serverId: string;
    isAdmin: boolean;
    createdAt: Date;
    updatedAt: Date;
}
