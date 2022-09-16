import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SigninUserDto } from 'src/dtos/users/signin-user-dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<string> {
    if(!email || !password){
      throw new BadRequestException("Les champs email et mot de passe sont requis.")
    }
    const signinUserDto : SigninUserDto = {email, password};
    const user = await this.authService.signin(signinUserDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}