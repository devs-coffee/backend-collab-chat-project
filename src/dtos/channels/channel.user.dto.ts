import { AutoMap } from '@automapper/classes';
import { UserDto } from '../users/user.dto';

export class UserChannelDto {
    @AutoMap()
    id?: string;

    @AutoMap()
    userId: string;

    @AutoMap()
    channelId: string;

    @AutoMap()
    user: UserDto
}
