import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper, mapWith } from '@automapper/core';
import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../dtos/users/user.dto';
import { LoginSignupResponse } from '../dtos/users/login-signup-response.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { ServerEntity } from '../servers/entities/server.entity';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { MessageEntity } from '../messages/entities/message.entity';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { ChannelDto } from '../dtos/channels/channel.dto';
import { UserChannelEntity } from '../channels/entities/userChannel.entity';
import { UserChannelDto } from '../dtos/channels/channel.user.dto';

@Injectable()
export class AutoMapping extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    override get profile() {
        return (mapper) => {
            //users
            createMap(mapper, CreateUserDto, UserEntity);
            createMap(mapper, UserEntity, UserDto);
            createMap(mapper, UserEntity, LoginSignupResponse);
            createMap(mapper, CreateUserDto, UserDto);
            createMap(mapper, UpdateUserDto, UserEntity);
            createMap(mapper, UserChannelEntity, UserEntity, forMember(u => u, mapFrom(ue => ue.user)))
            // will map the user without passwordConfirm, necessary to be able to create a user
            createMap(mapper, CreateUserDto, CreateUserDto);

            // servers
            createMap(mapper, ServerDto, ServerEntity);
            createMap(mapper, ServerEntity, ServerDto);
            createMap(mapper, ServerDto, UpdateServerDto);
            createMap(mapper, UpdateServerDto, ServerDto);

            // messages
            createMap(mapper, MessageEntity, MessageDto);
            createMap(mapper, MessageDto, MessageEntity);

            // channels
            createMap(mapper, ChannelEntity, ChannelDto, forMember(
                (destination) => destination.users,
                mapWith(UserChannelDto, UserChannelEntity, (source) => source.users))
            );

            createMap(mapper, UserChannelDto, UserChannelEntity);

            createMap(mapper, UserChannelEntity, UserChannelDto,forMember(
                (destination) => destination.user,
                mapWith(UserDto, UserEntity, (source) => source.user))
            );
            createMap(mapper, ChannelDto, ChannelEntity);
        };
    }
}