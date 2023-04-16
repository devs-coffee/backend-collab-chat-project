import { Injectable } from '@nestjs/common';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { ServerEntity } from './entities/server.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { UserServerEntity } from './entities/user-server-entity';

@Injectable()
export class ServerService {
  constructor(private prisma: PrismaService, @InjectMapper() readonly mapper : Mapper)  {}

  async create(server: ServerDto) {
    const serverEntity = this.mapper.map(server, ServerDto, ServerEntity);
    const created = await this.prisma.server.create({ data: serverEntity });
    if(created) {
        const userServer = new UserServerDto();
        userServer.serverId = created.id;
        userServer.isAdmin = true;
        userServer.userId = server.userId;
        const createdUserServer = await this.prisma.userServer.create({data: userServer});
        if(createdUserServer === null){
            // remove server from db in case userServer could not be created successfully
            await this.remove(created.id, createdUserServer.userId);
            return null;
        }
    }
    return created;
  }

  async findAll(userId) {
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
    const server = await this.prisma.server.findFirst({ where: { id }});
    const userServer = await this.prisma.userServer.findFirst({ where : { serverId: id ,  userId : userId}});
    const serverEntity = this.mapper.map(server, ServerEntity, ServerEntity)
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

  async search(name: string){
    const servers = await this.prisma.server.findMany({ where : {OR : [{ name : {contains: name.toLowerCase()}}, {categories: {hasSome: name.toLowerCase()}}]}, orderBy : { name : 'asc'}});
    return servers;
  }

  async joinOrLeave(server: UserServerEntity) {
    const hasAlreadyJoined = await this.prisma.userServer.findFirst({where : {AND : [{ serverId : server.serverId}, {userId : server.userId}]}});
    if(hasAlreadyJoined !== null){
      await this.prisma.userServer.delete({ where : {id :hasAlreadyJoined.id}})
      return false;
    }
    const joinedServer = await this.prisma.userServer.create({data: server});
    if(joinedServer){
      return true;
    }
    return false;
  }
}
