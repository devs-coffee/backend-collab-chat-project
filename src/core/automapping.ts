import { AutomapperProfile, InjectMapper } from '@automapper/nestjs';
import { createMap, forMember, mapFrom, Mapper, MappingProfile, mapWith } from '@automapper/core';
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
import { UserPrivateChannelEntity } from '../channels/entities/userPrivateChannel.entity';
import { UserChannelDto } from '../dtos/userChannels/user-channel-dto';
import { MessageCreateEntity } from '../messages/entities/message.create.entity';
import { ChannelServerDto } from '../dtos/channels/channel.server.dto';
import { UpdateMessageDto } from '../dtos/messages/update.message.dto';
import { ServerChannelEntity } from '../servers/entities/server.channels.entity';
import { UpdateChannelDto } from '../dtos/channels/update.channel.dto';
import { CreateChannelEntity } from '../channels/entities/create.channel.entity';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { UserServerEntity } from '../servers/entities/user-server-entity';
import { FullServerDto } from '../dtos/servers/fullServer.dto';
import { FullServerEntity } from '../servers/entities/fullServer.entity';
import { AuthUserDto } from '../dtos/users/auth.user.dto';

@Injectable()
export class AutoMapping extends AutomapperProfile {
    constructor(@InjectMapper() mapper: Mapper) {
        super(mapper);
    }

    get profile() : MappingProfile {
        return (mapper) => {
            //users
            createMap(mapper, CreateUserDto, UserEntity);
            createMap(mapper, UserEntity, UserDto, forMember(user => user.prefs, mapFrom(u => u.prefs)));
            createMap(mapper, UserEntity, AuthUserDto, forMember(u => u.refreshToken, mapFrom(u => u.refreshToken)));
            createMap(mapper, UserEntity, LoginSignupResponse);
            createMap(mapper, CreateUserDto, UserDto);
            createMap(mapper, UpdateUserDto, UserEntity);
            createMap(mapper, UserChannelEntity, UserEntity)
            // will map the user without passwordConfirm, necessary to be able to create a user
            createMap(mapper, CreateUserDto, CreateUserDto);

            // servers
            createMap(mapper, ServerDto, ServerEntity, forMember(server => server.categories, mapFrom(se => se.categories)));
            createMap(mapper, ServerEntity, ServerDto, forMember(server => server.categories, mapFrom(se => se.categories)));
            createMap(mapper, ServerEntity, ServerEntity, forMember(server => server.categories, mapFrom(se => se.categories)));
            createMap(mapper, FullServerEntity, FullServerDto, forMember(server => server.categories, mapFrom(se => se.categories)), forMember(server => server.channels, mapFrom(se => se.channels)));

            createMap(mapper, ServerDto, UpdateServerDto, forMember(server => server.categories, mapFrom(se => se.categories)));
            createMap(mapper, UpdateServerDto, ServerDto, forMember(server => server.categories, mapFrom(se => se.categories)));
            createMap(mapper, UpdateServerDto, ServerEntity, forMember(server => server.categories, mapFrom(se => se.categories)));
            // messages
            createMap(mapper, MessageDto, MessageEntity);
            createMap(mapper, MessageEntity, MessageDto, forMember(
                (destination) => destination.user,
                mapWith(UserDto, UserEntity, (source) => source.user))
            );
            createMap(mapper, MessageCreateEntity, MessageDto);
            createMap(mapper, MessageDto, MessageCreateEntity);
            createMap(mapper, UpdateMessageDto, MessageEntity);

            // channels
            createMap(mapper, ChannelEntity, ChannelDto, forMember(
                (destination) => destination.users,
                mapFrom((source) => source.users.map(u => u.userId)))
            );

            createMap(mapper, UserChannelDto, UserChannelEntity);

            


            createMap(mapper, ChannelDto, CreateChannelEntity);
            createMap(mapper, CreateChannelEntity, ChannelDto);

            createMap(mapper, ServerChannelEntity, ChannelServerDto, forMember(
                (destination) => destination.channels,
                mapWith(ChannelDto, ChannelEntity, (source) => source.channels))
            );
            createMap(mapper, UpdateChannelDto, CreateChannelEntity);
            createMap(mapper, CreateChannelEntity, UpdateChannelDto);

            createMap(mapper, UserServerDto, UserServerEntity);
        };
    }
}