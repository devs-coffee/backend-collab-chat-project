import { User } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';

export class UserEntity implements User {
    @ApiProperty()
    id: string;

    @ApiProperty()
    pseudo: string;

    @ApiProperty()
    password: string;

    @ApiProperty()
    email: string;

    @ApiProperty({ required: false, nullable: true})
    picture: Buffer | null;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
