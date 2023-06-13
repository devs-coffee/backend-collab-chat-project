import { AutoMap } from '@automapper/classes';
import { ApiProperty } from '@nestjs/swagger';
import { ChannelEntity } from 'src/channels/entities/channel.entity';
import { ServerEntity } from './server.entity';

export class FullServerEntity extends ServerEntity {
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

    @AutoMap()
    @ApiProperty()
    channels: ChannelEntity[];

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;

    @AutoMap()
    isCurrentUserAdmin?: boolean = false;

    @AutoMap()
    isCurrentUserMember?: boolean = false;
}