import { AutoMap } from '@automapper/classes';
import { PartialType } from '@nestjs/swagger';
import { ServerDto } from './server.dto';
import { ChannelEntity } from 'src/channels/entities/channel.entity';

export class UpdateServerDto extends PartialType(ServerDto) {
    @AutoMap()
    name?: string;

    @AutoMap()
    picture?: string;

    @AutoMap()
    categories?: string[];

    @AutoMap()
    isCurrentUserAdmin?: boolean;
}
