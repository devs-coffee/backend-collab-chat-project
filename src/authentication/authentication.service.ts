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
import { LoginSignupResponse } from '../dtos/users/login-signup-response.dto';
import { UserDto } from '../dtos/users/user.dto';
import { ServerService } from '../servers/server.service';

@Injectable()
export class AuthenticationService {
  private readonly saltRound = 10;

  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService, @InjectMapper() private readonly classMapper: Mapper, private readonly serverService: ServerService) {}

  async signin(signinUser : SigninUserDto): Promise<LoginSignupResponse> | null {
    const response = new LoginSignupResponse();
    const user = await this.usersService.findByEmail(signinUser);
    if (user && await bcrypt.compare(signinUser.password, user.password)) {
        const buildToken = { userId : user.id, email: user.email, pseudo: user.pseudo };
        response.access_token = this.jwtService.sign(buildToken);
        response.user = this.classMapper.map(user, UserEntity, UserDto);
        return response;
    }
    return null;
  }

  async signup(user : CreateUserDto): Promise<LoginSignupResponse> | null {
    const response = new LoginSignupResponse();
    if(user.password && user.password === user.passwordConfirm) {
        user.password = await bcrypt.hash(user.password, this.saltRound)
    } else {
      throw new Error(errorConstant.passwordNotMatching)
    }
    const userToCreate = this.classMapper.map(user, CreateUserDto, CreateUserDto);
    const createdUser = await this.usersService.create(userToCreate);
    if (createdUser) {
      const buildToken = { userId : createdUser.id, email: createdUser.email, pseudo: createdUser.pseudo };
      response.access_token = this.jwtService.sign(buildToken);
      response.user = this.classMapper.map(createdUser, UserEntity, UserDto);

      // this.serverService.create({
      //   name:'messages privés',
      //   isPrivate: true,
      //   userId: createdUser.id
      // })
      return response;
    }
    return null;
  }
}