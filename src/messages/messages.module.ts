import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelService } from '../channels/channel.service';
import { EventsGateway } from '../events/events.gateway';
import { ServersModule } from '../servers/servers.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ChannelService, EventsGateway],
  imports: [PrismaModule, ServersModule],
  exports: [MessagesService],
})
export class MessagesModule {}
