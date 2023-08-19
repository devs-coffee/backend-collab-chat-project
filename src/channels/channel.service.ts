import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { CreateChannelEntity } from './entities/create.channel.entity';
import { UserChannelEntity } from './entities/userChannel.entity';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}
  
  create(channel : CreateChannelEntity) {
    //! create userChannel for every members of the server ( or only allowed ones )
    return this.prisma.channel.create({data : channel});
  }

  async findChannelsByServerId(serverId: string) {
    const channels = await this.prisma.server.findFirst({ where : { id : serverId }, include: { channels : true }});
    return channels;
  }

  async findChannelsByUserId(userId: string) {
    const userChannels = await this.prisma.user.findFirst({where : {id : userId}, include : { channels : { select : { channelId : true}}}});
    const usersChannel = await this.prisma.channel.findMany({where : { id : { in : userChannels && userChannels.channels.length > 0 && userChannels.channels.map(c => c.channelId) || []}}, include : { users : { include : {user : true}}}});
    return usersChannel as ChannelEntity[];
  }

  async update(channelId: string, channelEntity: CreateChannelEntity) {
    return await this.prisma.channel.update({where: { id: channelId}, data: channelEntity});
  }

  async remove(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findFirst({where: { id: channelId }});
    if(channel){
      const userServer = await this.prisma.userServer.findFirst({where: { serverId : channel.serverId!, userId}});
      if (userServer && userServer.isAdmin){
        //! les userChannel sont-ils bien remove ?
        await this.prisma.channel.delete({where : { id : channelId }});
        return true;
      }
      return false;
    }
    return false;
  }

  async joinOrLeave(channel: UserChannelEntity) {
    //! Vérifier l'exploitation de cette fonction.
    const hasAlreadyJoined = await this.prisma.userChannel.findFirst({where : {AND : [{channelId: channel.channelId}, {userId: channel.userId}]}});
    if(hasAlreadyJoined !== null) {
      await this.prisma.userChannel.delete({ where : {id: hasAlreadyJoined.id}});
      return false;
    }
    await this.prisma.userChannel.create({data: channel});
    return true;
  }
}
