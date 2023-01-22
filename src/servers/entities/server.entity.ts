import { Server } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { ChannelEntity } from 'src/channels/entities/channel.entity';

export class ServerEntity implements Server {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    name: string;

    @AutoMap()
    @ApiProperty({ required: false, nullable: true})
    picture: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
