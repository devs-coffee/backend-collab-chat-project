import { AutoMap } from '@automapper/classes';
import { PartialType } from '@nestjs/swagger';
import { ChannelDto } from './channel.dto';

export class UpdateChannelDto extends PartialType(ChannelDto) {
    @AutoMap()
    title?: string;
}
