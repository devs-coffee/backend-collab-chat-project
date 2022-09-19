import { Module } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { LocalStrategy } from './local.strategy';
import { UsersModule } from '../users/users.module';
import { PassportModule } from '@nestjs/passport';
import { AuthenticationController } from './authentication.controller';
import { jwtConstants } from '../constants/auth.constants';
import { JwtModule } from '@nestjs/jwt';
import { Mapper } from '../core/mapper';

@Module({
    controllers: [AuthenticationController],
    imports: [UsersModule, PassportModule, JwtModule.register({
        secret: jwtConstants.secret,
        signOptions: { expiresIn: '60m' },
      }),],
    providers: [AuthenticationService, LocalStrategy, Mapper],
})
export class AuthenticationModule {}
