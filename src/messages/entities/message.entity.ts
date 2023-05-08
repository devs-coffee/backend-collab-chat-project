import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { Message } from '@prisma/client';
import { UserEntity } from '../../users/entities/user.entity';

export class MessageEntity implements Message {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    content: string;

    @AutoMap()
    @ApiProperty()
    userId: string;

    @ApiProperty()
    @AutoMap()
    channelId: string;

    @AutoMap()
    user?: UserEntity;

    @ApiProperty()
    @AutoMap()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
