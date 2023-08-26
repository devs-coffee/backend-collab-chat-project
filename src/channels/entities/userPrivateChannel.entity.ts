export class UserPrivateChannelEntity {
    
    id: string;
    title: string;
    serverId: string | null;
    createdAt: Date;
    updatedAt: Date;
    users: {
        user: {
            id: string;
            pseudo: string;
            picture: string | null;
        };
        lastRead: Date;
    }[];
    hasNew?: boolean;
    
}