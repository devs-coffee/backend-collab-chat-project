import { AutoMap } from '@automapper/classes';
import { PartialType } from '@nestjs/swagger';
import { ServerDto } from './server.dto';

export class UpdateServerDto extends PartialType(ServerDto) {
    @AutoMap()
    name?: string;

    @AutoMap()
    picture?: string;

    @AutoMap()
    categories?: string[];
}
