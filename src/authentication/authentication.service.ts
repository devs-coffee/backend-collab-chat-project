import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcrypt';
import { SigninUserDto } from '../dtos/users/signin-user-dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { errorConstant } from '../constants/errors.constants';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { Injectable } from '@nestjs/common';
import { UserDto } from '../dtos/users/user.dto';

@Injectable()
export class AuthenticationService {
  private readonly saltRound = 10;

  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService, @InjectMapper() private readonly classMapper: Mapper) {}
    
  async signin(signinUser : SigninUserDto): Promise<Object> {
    const user = await this.usersService.findByEmail(signinUser);
    if (user && await bcrypt.compare(signinUser.password, user.password)) {
        const buildToken = {userId : user.id, email: user.email, pseudo: user.pseudo};
        return {
          access_token : this.jwtService.sign(buildToken),
          user: user
        }
    }
    return null;
  }

  async signup(user : CreateUserDto): Promise<UserEntity> {
    if(user.password && user.password === user.passwordConfirm) {
        user.password = await bcrypt.hash(user.password, this.saltRound)
    } else {
      throw new Error(errorConstant.passwordNotMatching)
    }
    const userToCreate = this.classMapper.map(user, CreateUserDto, UserDto);
    const createdUser = await this.usersService.create(userToCreate);
    if (createdUser) {
        return createdUser;
    }
    return null;
  }
}