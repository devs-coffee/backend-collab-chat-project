import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SigninUserDto } from 'src/dtos/users/signin-user-dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';

@Injectable()
export class AuthenticationService {
    private saltRound = 10;

  constructor(private usersService: UsersService, private jwtService: JwtService) {}
    
  async signin(signinUser : SigninUserDto): Promise<string> | null {
    const user = await this.usersService.findByEmail(signinUser);
    if (user && await bcrypt.compare(signinUser.password, user.password)) {
        const buildToken = {userId : user.id, email: user.email, pseudo: user.pseudo};
        return this.jwtService.sign(buildToken);
    }
    return null;
  }

  async signup(user : CreateUserDto): Promise<string> | null {
    if(user.password) {
        user.password = await bcrypt.hash(user.password, this.saltRound)
    }
    const createdUser = await this.usersService.create(user);
    if (createdUser) {
        return "user successfully created";
    }
    return null;
  }
}