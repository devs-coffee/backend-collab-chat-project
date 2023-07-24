import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './local.strategy';
import { JwtStrategy } from './jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { jwtConstants } from '../constants/auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { ServersModule } from '../servers/servers.module';
import { AutoMapping } from '../core/automapping';

@Module({
    controllers: [AuthenticationController],
    imports: [UsersModule, PassportModule, ServersModule, JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '60m' },
      }),],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}
