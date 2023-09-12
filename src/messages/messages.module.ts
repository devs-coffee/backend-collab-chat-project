import { Module } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { MessagesController } from './messages.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelService } from '../channels/channel.service';
import { ServerService } from '../servers/server.service';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [MessagesController],
  providers: [MessagesService, ChannelService, ServerService],
  imports: [PrismaModule, EventsModule],
  exports: [MessagesService],
})
export class MessagesModule {}