import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class UserEntity implements User {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    pseudo: string;

    @AutoMap()
    @ApiProperty()
    password: string;

    @AutoMap()
    @ApiProperty()
    email: string;

    @AutoMap()
    @ApiProperty({ required: false, nullable: true})
    picture: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
