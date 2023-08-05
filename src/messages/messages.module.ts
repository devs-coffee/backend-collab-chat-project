import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelService } from '../channels/channel.service';
import { EventsGateway } from '../events/events.gateway';
import { ServerService } from 'src/servers/server.service';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ChannelService, EventsGateway, ServerService],
  imports: [PrismaModule],
  exports: [MessagesService],
})
export class MessagesModule {}
