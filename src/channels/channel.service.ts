import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserChannelDto } from 'src/dtos/userChannels/user-channel-dto';
import { PrismaService } from '../prisma/prisma.service';
import { ChannelEntity } from './entities/channel.entity';
import { CreateChannelEntity } from './entities/create.channel.entity';
import { UserChannelEntity } from './entities/userChannel.entity';

@Injectable()
export class ChannelService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}
  
  async create(channel : CreateChannelEntity) {
    //! create userChannel for every members of the server ( or only allowed ones )
    const createdChannel = await this.prisma.channel.create({data : channel});
    if(channel.serverId) {
      const serverUsers = await this.prisma.userServer.findMany({where: {serverId: channel.serverId}});
      console.log("users :", serverUsers);
      let data: UserChannelDto[] = [];
      for(let item of serverUsers) {
        data.push({
          userId: item.userId,
          channelId: createdChannel.id
        })
      }
      //! create userChannel
      await this.prisma.userChannel.createMany({data});
    }
    return createdChannel;
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

  async findPrivateChannelsByUserId(userId: string) {
    const chans = await this.prisma.channel.findMany({where: {AND: [{serverId: null}, {users: {some: {userId}}}]}, include: {users: {select: {user: true}, where: {user: {isNot: {id: userId}}}}}});
    console.log("My private chans :", chans)
    return chans;
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
