import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, ignore, Mapper } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../dtos/users/user.dto';

@Injectable()
export class AutoMapping extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            createMap(mapper, CreateUserDto, UserEntity);
            createMap(mapper, UserEntity, UserDto, forMember(dest => dest.password, ignore()));
            
            // the following mapping should never be returned to the client
            createMap(mapper, CreateUserDto, UserDto);
        };
    }
}