import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ChannelDto } from 'src/dtos/channels/channel.dto';
import { UserChannelDto } from 'src/dtos/userChannels/user-channel-dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { CreateChannelEntity } from './entities/create.channel.entity';
import { UserChannelEntity } from './entities/userChannel.entity';
import { UserPrivateChannelEntity } from './entities/userPrivateChannel.entity';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}
  
  async create(channel : CreateChannelEntity) {
    //* create userChannel for every members of the server ( or only allowed ones )
    const createdChannel = await this.prisma.channel.create({data : channel});
    if(channel.serverId) {
      const serverUsers = await this.prisma.userServer.findMany({where: {serverId: channel.serverId}});
      let data: UserChannelDto[] = [];
      for(let item of serverUsers) {
        data.push({
          userId: item.userId,
          channelId: createdChannel.id
        })
      }
      //* create userChannel
      await this.prisma.userChannel.createMany({data});
    }
    return createdChannel;
  }

  async findChannelsByServerId(serverId: string) {
    const channels = await this.prisma.server.findFirst({ where : { id : serverId }, include: { channels : true }});
    return channels;
  }

  async findPrivateChannelsByUserId(userId: string) {
    const chans = await this.prisma.channel.findMany({where: {AND: [{serverId: null}, {users: {some: {userId}}}]}, include: {users: {where : {NOT : {userId: userId}}}}});
    const channelsDto : ChannelDto[] = [];
    
    for(let chan of chans) {
      const unread = await this.prisma.message.findFirst({where: {AND: [{channelId: chan.id}, {createdAt: {gte: chan.users[0].lastRead}}]}});
      const channelDto = this.mapper.map(chan, ChannelEntity, ChannelDto);
      channelDto.hasNew = unread ? true : false;
      channelsDto.push(channelDto);
    }
    return channelsDto;
  }

  async update(channelId: string, channelEntity: CreateChannelEntity) {
    return await this.prisma.channel.update({where: { id: channelId}, data: channelEntity});
  }
  async putAsRead(channelId: string, userId: string) {
    //! not implemented
    //TODO update lastRead field
    
    return false;
  }

  async remove(channelId: string, userId: string) {
    const channel = await this.prisma.channel.findFirst({where: { id: channelId }});
    if(channel){
      const userServer = await this.prisma.userServer.findFirst({where: { serverId : channel.serverId!, userId}});
      if (userServer && userServer.isAdmin){
        await this.prisma.channel.delete({where : { id : channelId }});
        return true;
      }
      return false;
    }
    return false;
  }

  async joinOrLeave(channel: UserChannelEntity) {
    //TODO Vérifier l'exploitation de cette fonction.
    const hasAlreadyJoined = await this.prisma.userChannel.findFirst({where : {AND : [{channelId: channel.channelId}, {userId: channel.userId}]}});
    if(hasAlreadyJoined !== null) {
      await this.prisma.userChannel.delete({ where : {id: hasAlreadyJoined.id}});
      return false;
    }
    await this.prisma.userChannel.create({data: channel});
    return true;
  }
}
