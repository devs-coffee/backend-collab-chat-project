import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Request, Get, ForbiddenException } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { AuthenticationService } from './authentication.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.gard';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { errorConstant } from '../constants/errors.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { LoginSignupResponse } from '../dtos/users/login-signup-response.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../dtos/users/user.dto';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { TokensDto } from 'src/dtos/authentication/authentication.tokens.dto';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.guard';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService,  @InjectMapper() private readonly mapper: Mapper){}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: LoginSignupResponse })
  @ApiBadRequestResponse({ type : BadRequestException })
  async login(@Request() req) : Promise<OperationResult<LoginSignupResponse>> {
    const result = new OperationResult<LoginSignupResponse>();
    result.isSucceed = false;
    try {
      result.isSucceed = true;
      const response = req.user;
      result.result = response as LoginSignupResponse;
      return result;
    } catch (error) {
        Logger.log(error);
        if(error instanceof BadRequestException) { throw error };
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @Post('signup')
  @ApiCreatedResponse({ type: LoginSignupResponse })
  @ApiBadRequestResponse({ type : BadRequestException})
  async signup(@Body() user: CreateUserDto) : Promise<OperationResult<LoginSignupResponse>> {
    const result = new OperationResult<LoginSignupResponse>();
    result.isSucceed = false;
    try {
      const createdUser = await this.authenticationService.signup(user);
      if(createdUser) {
        result.isSucceed = true;
        result.result = createdUser;
      } else {
        throw new Error(errorConstant.userDoesNotExist);
      }
      return result;
    } catch (error) {
      Logger.log(error);
      if(error.message === errorConstant.passwordNotMatching){
        throw new BadRequestException(error.message);
      }
      if(error instanceof PrismaClientKnownRequestError  && error.message.includes("Unique constraint failed on the fields: (`pseudo`)")) {
        throw new BadRequestException(errorConstant.pseudoUnavailable);
      }
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get('getMe')
  async getMe(@Request() req): Promise<OperationResult<UserDto>> {
    const result = new OperationResult<UserDto>();
    result.isSucceed = false;
    try {
      result.result = this.mapper.map(req.user, UserEntity, UserDto);
      result.isSucceed = true;
      return result;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtRefreshAuthGuard)
  @ApiCreatedResponse({ type: TokensDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  @Get('refresh')
  async refreshTokens(@Request() req): Promise<OperationResult<TokensDto>> {
    const result = new OperationResult<TokensDto>();
    result.isSucceed = false;
    try {
      const userId = req.user.userId;
      const refreshToken = req.user.refreshToken;
      const tokens = await this.authenticationService.refreshTokens(userId, refreshToken);
      result.isSucceed = true;
      result.result = tokens;
      return result;
    } catch (error) {
        Logger.log(error);
        if(error instanceof ForbiddenException) {
          throw new BadRequestException(error.message)
        }
        throw new BadRequestException(errorConstant.errorOccured);
    }  
  }
}