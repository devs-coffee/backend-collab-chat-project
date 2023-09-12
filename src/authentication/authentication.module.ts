import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { jwtConstants } from '../constants/auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { ServersModule } from '../servers/servers.module';
import { RefreshTokenStrategy } from './strategies/jwt.refreshToken.strategy';

@Module({
    controllers: [AuthenticationController],
    imports: [UsersModule, PassportModule, ServersModule, JwtModule.register({})],
    providers: [AuthenticationService, LocalStrategy, JwtStrategy, RefreshTokenStrategy],
    exports: [AuthenticationService]
})
export class AuthenticationModule {}
