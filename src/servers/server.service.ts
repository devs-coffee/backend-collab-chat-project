import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, forwardRef, Inject, Injectable } from '@nestjs/common';
import { EventsGateway } from '../events/events.gateway';
import { errorConstant } from '../constants/errors.constants';
import { ServerDto } from '../dtos/servers/server.dto';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FullServerEntity } from './entities/fullServer.entity';
import { ServerEntity } from './entities/server.entity';
import { UserServerEntity } from './entities/user-server-entity';
import { UserDto } from '../dtos/users/user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserChannelDto } from 'src/dtos/userChannels/user-channel-dto';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService, @InjectMapper() readonly mapper : Mapper)  {}

  @Inject(forwardRef(() => EventsGateway))
  private readonly eventsGateway: EventsGateway

  async create(server: ServerDto) {
    const serverEntity = this.mapper.map(server, ServerDto, ServerEntity);
    //! À corriger et mettre sur plusiers lignes.
    const created = await this.prisma.server.create(
      { 
        data: {
          ...serverEntity,
          channels: {
            //! remove userChannel creation or update channelService.create(), serverService.joinOrLeave, etc.
            create: [{title: 'Général', users: {create: {userId: server.userId}}}] //create general channel, and userChannel
          },
          users: {
            create : [{userId: server.userId, isAdmin: true}] //create related userServer
          }
        }
        , include: { // include channels in DB response entity to convert into FullServerEntity
          channels: {select: {id: true, title: true, serverId: true}} 
        }
      }) as FullServerEntity;
    created.isCurrentUserAdmin = true;
    created.isCurrentUserMember = true;
    return created;
  }

  async findAll(userId:string) {
    if(userId){
        const servers = await this.prisma.server.findMany({where: { users : { some :{ userId } } }}) as ServerEntity[];
        for(let server of servers) {
          server.isCurrentUserMember = true;
          const userServer = await this.prisma.userServer.findFirst({where: {AND: [{userId}, {serverId: server.id}]}});
          server.isCurrentUserAdmin = userServer?.isAdmin;
        }
        return servers;
    }
    return null;
  }

  async findOne(id: string, userId: string) {
    const server = await this.prisma.server.findFirst({ where: { id }, include: {channels: {select: {title: true, id: true, serverId: true}}}}) as FullServerEntity;
    const userServer = await this.prisma.userServer.findFirst({ where : { serverId: id ,  userId : userId}});
    server.isCurrentUserMember = userServer ? true : false;
    server.isCurrentUserAdmin  = userServer ? userServer.isAdmin : false;
    return server;
  }

  async update(id: string, updateServerDto: UpdateServerDto) {
    const userServer = await this.prisma.userServer.findFirst({ where: { serverId: id, userId : updateServerDto.userId }});
    if(userServer?.isAdmin){
      const serverToUpdate = this.mapper.map(updateServerDto, UpdateServerDto, ServerEntity);  
      const updated = await this.prisma.server.update({
        where: { id },
        data: serverToUpdate,
        include: {channels: {select: {title: true, id: true, serverId: true}}}
      }) as FullServerEntity;
      updated.isCurrentUserAdmin = true;
      updated.isCurrentUserMember = true;
      return updated;
    }
    return new Error(errorConstant.noUserRightsOnServer);
  }

  async remove(id: string, userId: string) {
    const userServer = await this.prisma.userServer.findFirst({ where: { serverId: id, userId : userId }});
    if(!userServer){
      throw new Error(errorConstant.itemNotExisting);
    }
    if(userServer && userServer.isAdmin){
        // remove server & on cascade userServer
        const deleted = await this.prisma.server.delete({ where: { id } });
        if(deleted){
          return true;
        }
        throw new Error(errorConstant.itemNotExisting);
    }
    return false;
  }

  async search(keyword: string){
    if(keyword === '' || keyword === null){
      throw new BadRequestException(errorConstant.provideAKeywordToSearchAServer);
    }
    const servers = await this.prisma.server.findMany({ where : {OR : [{ name : {contains: keyword, mode: 'insensitive'}}, {categories: {hasSome: keyword.toLowerCase()}}]}, orderBy : { name : 'asc'}});
    return servers;
  }

  async joinOrLeave(userServer: UserServerEntity) {
    const hasAlreadyJoined = await this.prisma.userServer.findFirst({where : {AND : [{ serverId : userServer.serverId}, {userId : userServer.userId}]}});
    const userEntity = await this.prisma.user.findUnique({where: {id: userServer.userId}});
    const user = this.mapper.map(userEntity, UserEntity, UserDto);

    //* user is member, si this is a leave request
    if(hasAlreadyJoined !== null){
      const serverAdmins = await this.prisma.userServer.findMany({where: {AND : [{ serverId: userServer.serverId}, {isAdmin: true}]}});
      if(serverAdmins.length < 2 && serverAdmins[0].userId === userServer.userId) {
        throw new BadRequestException(errorConstant.lastAdminCannotLeave);
      }
      await this.prisma.userServer.delete({ where : {id :hasAlreadyJoined.id}});
      // delete userchannels
      const serverChannels = await this.prisma.channel.findMany({where: {serverId: hasAlreadyJoined.serverId}});
      //TODO : possibilité de ne faire qu'une seule requête prisma ?
      for(let channel of serverChannels) {
        await this.prisma.userChannel.deleteMany({where: {AND : [{userId: userServer.userId}, {channelId: channel.id}]}});
      }
      this.eventsGateway.handleLeaveServer(user!, userServer.serverId);
      return false;
    }

    //* user is not member, so this is a join
    const joinedServer = await this.prisma.userServer.create({data: userServer});
    if(joinedServer){
      //! Create userChannel for every public channel of the server
      const serverChans = await this.prisma.channel.findMany({where: {serverId: userServer.serverId}, select: {id: true}});
      let data: UserChannelDto[] = [];
      for(let chan of serverChans) {
        data.push({
          userId: userServer.userId,
          channelId: chan.id
        })
      }
      await this.prisma.userChannel.createMany({data});
      
      this.eventsGateway.handleJoinServer(user, userServer.serverId);
      //? return FullServerEntity instead?
      return true;
    }
    return false;
  }
}