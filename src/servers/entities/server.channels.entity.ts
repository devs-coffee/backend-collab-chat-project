import { Server } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { ChannelEntity } from '../../channels/entities/channel.entity';

export class ServerChannelEntity implements Server {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    name: string;

    @AutoMap()
    @ApiProperty({ required: false, nullable: true})
    picture: string;

    @AutoMap()
    @ApiProperty()
    categories: string[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @AutoMap()
    @ApiProperty()
    channels: ChannelEntity[];
}
