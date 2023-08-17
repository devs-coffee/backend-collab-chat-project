import { forwardRef, Module } from '@nestjs/common';
import { ServerService } from './server.service';
import { ServerController } from './server.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersModule } from '../users/users.module';
import { EventsModule } from '../events/events.module';

@Module({
  controllers: [ServerController],
  providers: [ServerService],
  imports: [PrismaModule, UsersModule, forwardRef(() => EventsModule)],
  exports: [ServerService],
})
export class ServersModule {}