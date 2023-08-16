import { Global, Module } from '@nestjs/common';
import { ServersModule } from 'src/servers/servers.module';
import { EventsGateway } from './events.gateway';

@Global()
@Module({
    imports: [ServersModule],
    providers: [EventsGateway],
    exports: [EventsGateway]
  })
  export class EventsModule {
    
  }