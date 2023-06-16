import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Injectable } from '@nestjs/common';
import { errorConstant } from '../constants/errors.constants';
import { FullServerDto } from '../dtos/servers/fullServer.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { PrismaService } from '../prisma/prisma.service';
import { FullServerEntity } from './entities/fullServer.entity';
import { ServerEntity } from './entities/server.entity';
import { UserServerEntity } from './entities/user-server-entity';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService, @InjectMapper() readonly mapper : Mapper)  {}

  async create(server: ServerDto) {
    const serverEntity = this.mapper.map(server, ServerDto, ServerEntity);
    const created = await this.prisma.server.create({ data: {...serverEntity, channels: {create: [{title: 'Général', users: {create: {userId: server.userId}}}]}, users: { create : [{userId: server.userId, isAdmin: true}]}}, include: { channels: {select: {id: true, title: true, serverId: true}} } });
    const response = this.mapper.map(created, FullServerEntity, FullServerDto);
    response.isCurrentUserAdmin = true;
    response.isCurrentUserMember = true;
    return response;
  }

  async findAll(userId:string) {
    if(userId){
        const servers = await this.prisma.server.findMany({where: { users : { some :{ userId } } }});
        const serverDTOs = this.mapper.mapArray(servers, ServerEntity, ServerDto);
        for(let server of serverDTOs) {
          server.isCurrentUserMember = true;
          const userServer = await this.prisma.userServer.findFirst({where: {AND: [{userId}, {serverId: server.id}]}});
          server.isCurrentUserAdmin = userServer.isAdmin;
        }
        return serverDTOs;
    }
    return null;
  }

  async findOne(id: string, userId: string) {
    const server = await this.prisma.server.findFirst({ where: { id }, include: {channels: {select: {title: true, id: true, serverId: true}}}});
    const userServer = await this.prisma.userServer.findFirst({ where : { serverId: id ,  userId : userId}});
    const serverEntity = this.mapper.map(server, FullServerEntity, FullServerDto);
    serverEntity.isCurrentUserMember = userServer ? true : false;
    serverEntity.isCurrentUserAdmin  = userServer ? userServer.isAdmin : false;
    return serverEntity;
  }

  async update(id: string, updateServerDto: UpdateServerDto) {
    const userServer = await this.prisma.userServer.findFirst({ where: { serverId: id, userId : updateServerDto.userId }});
    if(userServer.isAdmin){
      const serverToUpdate = this.mapper.map(updateServerDto, UpdateServerDto, ServerEntity);  
      const updated = await this.prisma.server.update({
        where: { id },
        data: serverToUpdate,
        include: {channels: {select: {title: true, id: true, serverId: true}}}
      });
      const response = this.mapper.map(updated, FullServerEntity, FullServerDto);
      response.isCurrentUserAdmin = true;
      response.isCurrentUserMember = true;
      return response;
    }
    return new Error(errorConstant.noUserRights);
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

  async joinOrLeave(server: UserServerEntity) {
    const hasAlreadyJoined = await this.prisma.userServer.findFirst({where : {AND : [{ serverId : server.serverId}, {userId : server.userId}]}});
    if(hasAlreadyJoined !== null){
      const serverAdmins = await this.prisma.userServer.findMany({where: {AND : [{ serverId: server.serverId}, {isAdmin: true}]}});
      if(serverAdmins.length < 2 && serverAdmins[0].userId === server.userId) {
        throw new BadRequestException(errorConstant.lastAdminCannotLeave);
      }
      await this.prisma.userServer.delete({ where : {id :hasAlreadyJoined.id}});
      //! côté client, mettre à jour le serveur
      return false;
    }
    const joinedServer = await this.prisma.userServer.create({data: server});
    if(joinedServer){
      //! côté client, mettre à jour le serveur
      return true;
    }
    return false;
  }
}