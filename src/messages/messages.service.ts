import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { ChannelService } from '../channels/channel.service';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageCreateEntity } from './entities/message.create.entity';
import { EventsGateway } from '../events/events.gateway';
import { MessageEntity } from './entities/message.entity';
import { CreateChannelEntity } from 'src/channels/entities/create.channel.entity';

@Injectable()
export class MessagesService {
  constructor(
    private prisma: PrismaService,
    @InjectMapper() private readonly mapper: Mapper,
    private readonly channelService : ChannelService
  )  {}

  @Inject(EventsGateway)
  private readonly eventsGateway: EventsGateway

  async create(messageDto: MessageDto) {
    const message = this.mapper.map(messageDto, MessageDto, MessageCreateEntity);
    let channelId = message.channelId;
    // if no channel then it is a private message
    if(!channelId) {
      // check in there already is a private channel between these users
      const existingChannel = await this.prisma.channel.findFirst({where : {AND: [{serverId: null}, {users: {some: {userId: messageDto.userId}}}, {users: {some: {userId: messageDto.toUserId}}}]}});
      if(existingChannel) {
        channelId = existingChannel.id;
      }
      else {
        // First private message between these users. Create channel first
        const channel = new CreateChannelEntity();
        channel.title = "";
        const createdChannel = await this.channelService.create(channel);
        channelId = createdChannel.id;
        await this.prisma.userChannel.createMany({data : 
          [
            { userId : message.userId, channelId : channelId },
            { userId : messageDto.toUserId!, channelId: channelId }
          ]
        })
      }
    }
    const channel = await this.prisma.channel.findUnique({where: {id: channelId}});
    if(channel && channel.serverId){
      await this.prisma.userServer.findFirstOrThrow({where : {AND: [{serverId: channel.serverId}, {userId: message.userId}]}});
      //TODO reformater l'erreur pour le front
    }
    const created = await this.prisma.message.create({data : {...message, channelId}});
    const serverId = channel && channel.serverId ? channel.serverId : null;
    const toUser = serverId === null ? messageDto.toUserId! : null;
    this.eventsGateway.handleMessage(channelId, created, serverId, toUser);
    return await this.prisma.message.findFirst({where: {id: created.id}, include: { user: true }}) as MessageEntity;
  }
  
  async getMyMessagesByChannelId(channelId: string, offset?: string){
    let criterias:any = {where : { channelId }, include : { user : {select: {id: true, pseudo: true}}}, take: -10, orderBy: {createdAt: 'asc'}};
    if(offset) {
      criterias.cursor = {id: offset};
      criterias.skip = 1;
    }
    const messages = await this.prisma.message.findMany(criterias);
    return messages;
  }

  async update(messageId: string, messageEntity: MessageCreateEntity) {
    const updated = await this.prisma.message.update({where: { id: messageId}, data: messageEntity});
    const server = await this.prisma.server.findFirst({where : {channels: {some: {id: updated.channelId}}}});
    let serverId: string | null = null;
    let toUser: string | null = null;
    if(server) {
      serverId = server.id;
    }
    else { 
      const privateChan = await this.prisma.channel.findFirst({where : {id: messageEntity.channelId}, include: {users: true}});
      toUser = privateChan?.users.find(userChan => userChan.userId !== updated.userId)?.userId!;
    };
    this.eventsGateway.handleUpdateMessage(updated, serverId, toUser);
    return updated;
  }

  async remove(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({where: { id: messageId, userId : userId}});
    if(message){
      const channel = await this.prisma.channel.findFirst({where: {id: message.channelId}, include: {users: true}});
      let serverId: string | null = null;
      let toUser: string | null = null;
      if(channel?.serverId !== null) {
        serverId = channel?.serverId!;
      }
      else {
        let idList = channel.users.map(elt => elt.userId);
        toUser = idList.find(elt => elt !== message.userId)!;
      }
      this.eventsGateway.handleDeleteMessage(message, serverId, toUser);
      await this.prisma.message.delete({where : { id : messageId}});
      return true;
    }
    return false;
  }
}
