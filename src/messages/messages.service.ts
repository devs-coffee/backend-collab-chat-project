import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Inject, Injectable } from '@nestjs/common';
import { ChannelService } from '../channels/channel.service';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageCreateEntity } from './entities/message.create.entity';
import { EventsGateway } from '../events/events.gateway';
import { MessageEntity } from './entities/message.entity';

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
    if(!channelId) {
      // if no channel then it is a new message (one to one) so we need to create channel first
      const channel = new ChannelEntity();
      channel.title = "";
      const createdChannel = await this.channelService.create(channel);
      channelId = createdChannel.id;
      await this.prisma.userChannel.createMany({data : 
        [
          {
            userId : message.userId,
            channelId : channelId
          },
          {
            userId : messageDto.toUserId!,
            channelId: channelId
          }
        ]
      })
    }
    const channel = await this.prisma.channel.findUnique({where: {id: channelId}});
    if(channel && channel.serverId){
      await this.prisma.userServer.findFirstOrThrow({where : {AND: [{serverId: channel.serverId}, {userId: message.userId}]}});
      //! reformater l'erreur pour le front
    }
    const created = await this.prisma.message.create({data : {...message, channelId}});
    //! modifier les params pour cibler l'envoi d'events.
    //? param server: serverId || null
    //? param users: {from: messageDto.userId, to: messageDto.}
    //* le from n'est pas forcément utile. on envoie l'event uniquement au destinataire ?
    const serverId = channel && channel.serverId ? channel.serverId : null;
    const users = serverId === null ? {from: messageDto.userId, to: messageDto.toUserId!} : null;
    this.eventsGateway.handleMessage(channelId, created, serverId, users);
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
    this.eventsGateway.handleUpdateMessage(messageId, updated, null, null);
    return updated;
  }

  async remove(messageId: string, userId: string) {
    const message = await this.prisma.message.findFirst({where: { id: messageId, userId : userId}});
    if(message){
      await this.prisma.message.delete({where : { id : messageId}});
      return true;
    }
    return false;
  }
}
