import { ApiProperty } from '@nestjs/swagger';


export class CreateUserDto {
    @ApiProperty()
    pseudo: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    picture?: Buffer;
}
