import { BadRequestException, Injectable } from '@nestjs/common';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { ServerEntity } from './entities/server.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { UserServerEntity } from './entities/user-server-entity';
import { FullServerEntity } from './entities/fullServer.entity';
import { FullServerDto } from '../dtos/servers/fullServer.dto';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService, @InjectMapper() readonly mapper : Mapper)  {}

  async create(server: ServerDto) {
    const serverEntity = this.mapper.map(server, ServerDto, ServerEntity);
    const created = await this.prisma.server.create({ data: {...serverEntity, channels: {create: [{title: 'Général', users: {create: {userId: server.userId}}}]}, users: { create : [{userId: server.userId, isAdmin: true}]}} });
    return created;
  }

  async findAll(userId:string) {
    if(userId){
        const servers = await this.prisma.server.findMany({where: { users : { some :{ userId: userId} } }});
        const allUserServers = await this.prisma.userServer.findMany({ where : { userId : userId}});
        const serverEntities = this.mapper.mapArray(servers, ServerEntity, ServerEntity);
        serverEntities.forEach(server => {
          allUserServers.forEach(userServer => {
            if(server.id === userServer.serverId){
              server.isCurrentUserAdmin = userServer.isAdmin;
            }
          });
        });
        return serverEntities;
    }
    return null;
  }

  async findOne(id: string, userId: string) {
    const server = await this.prisma.server.findFirst({ where: { id }, include: {channels: {select: {title: true, id: true, serverId: true}}}});
    const userServer = await this.prisma.userServer.findFirst({ where : { serverId: id ,  userId : userId}});
    const serverEntity = this.mapper.map(server, FullServerEntity, FullServerDto);
    serverEntity.isCurrentUserAdmin  = userServer ? userServer.isAdmin : false;
    return serverEntity;
  }

  async update(id: string, updateServerDto: UpdateServerDto) {
    const userServer = await this.prisma.userServer.findFirst({ where: { serverId: id, userId : updateServerDto.userId }});
    if(userServer.isAdmin){
      const serverToUpdate = this.mapper.map(updateServerDto, UpdateServerDto, ServerEntity);  
      return this.prisma.server.update({
            where: { id },
            data: serverToUpdate,
        });
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
      return false;
    }
    const joinedServer = await this.prisma.userServer.create({data: server});
    if(joinedServer){
      return true;
    }
    return false;
  }
}
