import { Server } from '@prisma/client';
import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';

export class ServerEntity implements Server {
    @AutoMap()
    @ApiProperty()
    id: string;

    @AutoMap()
    @ApiProperty()
    name: string;

    @AutoMap()
    @ApiProperty({ required: false, nullable: true})
    picture: string;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
