import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
    @ApiProperty()
    id?: string;

    @ApiProperty()
    pseudo: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    email: string;

    @ApiProperty()
    picture?: string;
}
