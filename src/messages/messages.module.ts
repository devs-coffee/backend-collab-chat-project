import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelService } from '../channels/channel.service';
import { EventsGateway } from '../events/events.gateway';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ChannelService, EventsGateway],
  imports: [PrismaModule],
  exports: [MessagesService],
})
export class MessagesModule {}
