import { Strategy } from 'passport-local';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthenticationService } from '../authentication.service';
import { SigninUserDto } from '../../dtos/users/signin-user-dto';
import { errorConstant } from '../../constants/errors.constants';
import { LoginSignupResponse } from '../../dtos/users/login-signup-response.dto';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthenticationService) {
    super({ usernameField: 'email' });
  }

  async validate(email: string, password: string): Promise<LoginSignupResponse> {
    if(email === "" || password === "") {
      throw new Error(errorConstant.requiredPasswordEmailFields)
    }
    const signinUserDto : SigninUserDto = { email, password };
    const user = await this.authService.signin(signinUserDto);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}