import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { ChannelService } from '../channels/channel.service';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { PrismaService } from '../prisma/prisma.service';
import { MessageCreateEntity } from './entities/message.create.entity';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper, private readonly channelService : ChannelService)  {}

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
            userId : messageDto.toUserId,
            channelId: channelId
          }
        ]
      })
    } 
    return this.prisma.message.create({data : {...message, channelId}});
  }

  async getMyMessagesByChannelId(channelId: string, offset?: string){
    let criterias:any = {where : { channelId }, include : { user : {select: {id: true, pseudo: true}}}, take: -10, orderBy: {createdAt: 'desc'}};
    if(offset) {
      criterias.cursor = {id: offset};
      criterias.skip = 1;
    }
    const messages = await this.prisma.message.findMany(criterias);
    return messages;
  }

  async update(messageId: string, messageEntity: MessageCreateEntity) {
    return await this.prisma.message.update({where: { id: messageId}, data: messageEntity});
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
