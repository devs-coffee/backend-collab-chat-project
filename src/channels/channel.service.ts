import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ChannelEntity } from './entities/channel.entity';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}
    create(channel : ChannelEntity) {
        return this.prisma.channel.create({data : channel});
    }

    // async findChannelsByServerId(serverId : string) {
    //   const channels = await this.prisma.channel.findMany({ where : { serverId }, include: { users : { include : { user : true}}}});
    //   return channels;
    // }

    async findChannelsByServerId(serverId: string) {
      const channels = await this.prisma.server.findFirst({ where : { id : serverId }, include: { channels : {include : { users : { include : { user : true}}}} }});
      return channels;
    }

    async findChannelsByUserId(userId: string) {
      const { channels } = await this.prisma.user.findFirst({where : {id : userId}, include : { channels : { select : { channelId : true}}}});
      const usersChannels = await this.prisma.channel.findMany({where : { id : { in : channels.map(c => c.channelId)}}, include : { users : { include : { user : true }}}});
      return usersChannels;
    }

    async findChannelById(channelId: string){
      
    }
}
