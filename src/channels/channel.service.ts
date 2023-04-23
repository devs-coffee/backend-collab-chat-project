import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateChannelEntity } from './entities/create.channel.entity';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}
  
  create(channel : CreateChannelEntity) {
      return this.prisma.channel.create({data : channel});
  }

  async findChannelsByServerId(serverId: string) {
    const channels = await this.prisma.server.findFirst({ where : { id : serverId }, include: { channels : true }});
    return channels;
  }

  async findChannelsByUserId(userId: string) {
    const { channels } = await this.prisma.user.findFirst({where : {id : userId}, include : { channels : { select : { channelId : true}}}});
    const usersChannel = await this.prisma.channel.findMany({where : { id : { in : channels.map(c => c.channelId)}}, include : { users : { include : {user : true}}}});
    return usersChannel;
  }

  async update(channelId: string, channelEntity: CreateChannelEntity) {
    return await this.prisma.channel.update({where: { id: channelId}, data: channelEntity});
  }

  async remove(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findFirst({where: { id: channelId }});
    const userServer = await this.prisma.userServer.findFirst({where: { serverId : channel.serverId, userId}});
    if (userServer.isAdmin){
      await this.prisma.channel.delete({where : { id : channelId }});
      return true;
    }

    return false;
  }
}
