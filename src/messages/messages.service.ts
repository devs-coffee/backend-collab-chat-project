import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { ChannelService } from '../channels/channel.service';
import { ChannelEntity } from '../channels/entities/channel.entity';
import { MessageEntity } from './entities/message.entity';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper, private readonly channelService : ChannelService)  {}

  async create(messageDto: MessageDto) {
    const message = this.mapper.map(messageDto, MessageDto, MessageEntity);
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

  async getMyMessagesByChannelId(channelId: string){
    const messages = await this.prisma.message.findMany({where : { channelId }, include : { user : true}});
    return messages;
  }
}
