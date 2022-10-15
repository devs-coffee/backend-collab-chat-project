import { Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
  imports: [PrismaModule, UsersModule],
  exports: [ServerService],
})
export class ServersModule {}
