import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { UserDto } from './user.dto';
import { AuthUserDto } from './auth.user.dto';

export class LoginSignupResponse {
    @AutoMap()
    @ApiProperty()
    user: UserDto

    @ApiProperty()
    access_token: string;
}