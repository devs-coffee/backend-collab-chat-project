import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class CreateUserDto implements IUser {
    @AutoMap()
    @ApiProperty()
    pseudo: string;

    @AutoMap()
    @ApiProperty()
    password: string;

    @ApiProperty()
    passwordConfirm: string;

    @AutoMap()
    @ApiProperty()
    email: string;

    @AutoMap()
    @ApiProperty()
    picture?: string;
}
