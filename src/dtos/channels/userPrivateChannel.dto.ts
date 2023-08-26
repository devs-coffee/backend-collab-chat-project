import { AutoMap } from '@automapper/classes';
import { UserDto } from '../users/user.dto';

export class UserPrivateChannelDto {
    @AutoMap()
    user?: UserDto;
    @AutoMap()
    lastRead: Date;
}