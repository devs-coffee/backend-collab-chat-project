import { Module, forwardRef } from '@nestjs/common';
import { ServersModule } from '../servers/servers.module';
import { EventsGateway } from './events.gateway';

@Module({
  imports: [forwardRef(() => ServersModule)],
  providers: [EventsGateway],
  exports: [EventsGateway]
})
export class EventsModule {}