import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
  imports: [PrismaModule],
  exports: [ServerService],
})
export class ServersModule {}
