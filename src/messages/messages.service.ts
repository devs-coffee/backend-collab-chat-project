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
        // create channel first
        const {server} = await this.prisma.userServer.findFirst({ where : { userId : message.userId}, select : { server : true}});
        const serverId = server.id;
        const channel = new ChannelEntity();
        channel.serverId = serverId;
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
              userId : messageDto.fromUserId,
              channelId: channelId
            }
          ]
      })
      } 
      return this.prisma.message.create({data : {...message, channelId}});
      // const userServers = await this.prisma.userServer.findMany(
      //   { 
      //     where : {
      //         userId 
      //       },
      //       select : {
      //         server : true
      //       }
      //   });

      // const {server} = userServers.find(s => s.server.isPrivate);
      // const serverId = server.id;
      // if(serverId) {
      //   this.prisma.channel.findFirst({ where : { serverId }})
      // }
  }

}
