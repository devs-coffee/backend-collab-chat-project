import { Injectable } from '@nestjs/common';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { PrismaService } from '../prisma/prisma.service';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { ServerEntity } from './entities/server.entity';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';

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

  findAll(userId) {
    if(userId){
        return this.prisma.server.findMany({where: { users : { some :{ userId: userId} } }});
    }
    return null;
  }

  findOne(id: string) {
    return this.prisma.server.findUnique({ where: { id }});
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
        console.log(deleted)
        if(deleted){
          return true;
        }
        throw new Error(errorConstant.itemNotExisting);
    }
    return false;
  }
}
