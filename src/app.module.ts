import { AutomapperModule } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthenticationModule } from './authentication/authentication.module';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { ServersModule } from './servers/servers.module';
import { MessagesModule } from './messages/messages.module';
import { ChannelModule } from './channels/channel.module';
import { AutoMapping } from './core/automapping';

@Module({
  imports: [PrismaModule, UsersModule, MessagesModule, ChannelModule, AuthenticationModule, ServersModule, AutomapperModule.forRoot({
    strategyInitializer: classes(),
}),],
  controllers: [AppController],
  providers: [AppService, AutoMapping],
})
export class AppModule {}
