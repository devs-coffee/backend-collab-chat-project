import { UsersService } from '../users/users.service';
import * as bcrypt from 'bcryptjs';
import { SigninUserDto } from '../dtos/users/signin-user-dto';
import { JwtService } from '@nestjs/jwt';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { errorConstant } from '../constants/errors.constants';
import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { ForbiddenException, Injectable } from '@nestjs/common';
import { LoginSignupResponse } from '../dtos/users/login-signup-response.dto';
import { UserDto } from '../dtos/users/user.dto';
import { ServerService } from '../servers/server.service';
import { TokensDto } from 'src/dtos/authentication/authentication.tokens.dto';
import { jwtConstants } from 'src/constants/auth.constants';
import { AuthUserDto } from 'src/dtos/users/auth.user.dto';

@Injectable()
export class AuthenticationService {
  private readonly saltRound = 10;

  constructor(private readonly usersService: UsersService, private readonly jwtService: JwtService, @InjectMapper() private readonly classMapper: Mapper, private readonly serverService: ServerService) {}

  async signin(signinUser : SigninUserDto): Promise<LoginSignupResponse | null> {
    const response = new LoginSignupResponse();
    const user = await this.usersService.findByEmail(signinUser);
    if (user && await bcrypt.compare(signinUser.password, user.password)) {
        const tokens = await this.getTokens(user.id, user.pseudo);
        await this.updateRefreshToken(user.id, tokens.refreshToken);
        response.access_token = tokens.access_token;
        user.refreshToken = tokens.refreshToken;
        response.user = this.classMapper.map(user, UserEntity, AuthUserDto);
        return response;
    }
    return null;
  }

  async signup(user : CreateUserDto): Promise<LoginSignupResponse | null> {
    const response = new LoginSignupResponse();
    if(user.password && user.password === user.passwordConfirm) {
        user.password = await bcrypt.hash(user.password, this.saltRound)
    } else {
      throw new Error(errorConstant.passwordNotMatching)
    }
    const userToCreate = this.classMapper.map(user, CreateUserDto, CreateUserDto);
    const createdUser = await this.usersService.create(userToCreate);
    if (createdUser) {
      const tokens = await this.getTokens(createdUser.id, createdUser.pseudo);
      await this.updateRefreshToken(createdUser.id, tokens.refreshToken);
      response.access_token = tokens.access_token;
      createdUser.refreshToken = tokens.refreshToken;
      response.user = this.classMapper.map(createdUser, UserEntity, AuthUserDto);
      return response;
    }
    return null;
  }

  async hashData(data: string) {
    return await bcrypt.hash(data, 10);
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    const hashedRefreshToken = await this.hashData(refreshToken);
    await this.usersService.update(userId, {
      refreshToken: hashedRefreshToken,
    });
  }

  async getTokens(userId: string, username: string): Promise<TokensDto> {
    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(
        {
          userId: userId,
          pseudo: username,
        },
        {
          secret: jwtConstants.secret,
          expiresIn: '1h',
        },
      ),
      this.jwtService.signAsync(
        {
          userId: userId,
          pseudo: username,
        },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);
    const tokens = new TokensDto();
    tokens.access_token = accessToken;
    tokens.refreshToken = refreshToken;
    return tokens;
  }


  async refreshTokens(userId: string, refreshToken: string): Promise<TokensDto> {
    const user = await this.usersService.findOne(userId);
    if (!user || !user.refreshToken) {
      throw new ForbiddenException('Access Denied');
    }
    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.refreshToken
    );
    if (!refreshTokenMatches){
      throw new ForbiddenException('Access Denied');
    } 
    const tokens = await this.getTokens(user.id, user.pseudo);
    await this.updateRefreshToken(user.id, tokens.refreshToken);
    return tokens;
  }
}