import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserDto } from '../users/user.dto';

export class MessageDto {
    @AutoMap()
    @ApiProperty()
    id?: string;

    @AutoMap()
    @ApiProperty()
    content: string;

    @AutoMap()
    @ApiProperty()
    userId: string;

    toUserId?: string;

    @AutoMap()
    @ApiProperty()
    channelId? : string;

    @AutoMap()
    user?: UserDto;

    @AutoMap()
    @ApiProperty()
    createdAt: Date;
}
