import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { Request } from 'express';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class RefreshTokenStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(private readonly userService: UsersService) {
    super({
      ignoreExpiration: false,
      passReqToCallback: true,
      jwtFromRequest:ExtractJwt.fromExtractors([(request:Request) => {
        let data = request?.cookies["refreshToken"];
        if(!data){
            return null;
        }
        return data;
    }]),
    secretOrKey: process.env.JWT_REFRESH_SECRET,
    });
  }

  async validate(payload :Request, user: any){
    if(payload === null || user === null){
        throw new UnauthorizedException();
    }
    
    return user;
  }
}