import { AutoMap } from '@automapper/classes';
import { UserServer } from '@prisma/client';

export class UserServerEntity implements UserServer {
    id: string;
    @AutoMap()
    userId: string;

    @AutoMap()
    serverId: string;

    @AutoMap()
    isAdmin: boolean;
    
    createdAt: Date;
    updatedAt: Date;
}
