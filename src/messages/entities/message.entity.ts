import { Message, Server, User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
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

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
