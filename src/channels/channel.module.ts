import { Module } from '@nestjs/common';
import { ChannelService } from './channel.service';
import { PrismaModule } from '../prisma/prisma.module';
import { ChannelController } from './channel.controller';

@Module({
  controllers : [ChannelController],
  providers: [ChannelService],
  imports: [PrismaModule],
  exports: [ChannelService],
})
export class ChannelModule {}
