import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Request, Get, ForbiddenException, Response } from '@nestjs/common';
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
  async login(@Request() req, @Response({ passthrough: true }) res) : Promise<OperationResult<LoginSignupResponse>> {
    const result = new OperationResult<LoginSignupResponse>();
    result.isSucceed = false;
    try {
      result.isSucceed = true;
      const userSignedIn = await this.authenticationService.signin(req.user);
      if(userSignedIn) {
        res.cookie('refreshToken', userSignedIn.refreshToken, { httpOnly: true });
        result.result = userSignedIn.user;
      }

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
  async signup(@Body() user: CreateUserDto, @Response({passthrough: true}) res) : Promise<OperationResult<LoginSignupResponse>> {
    const result = new OperationResult<LoginSignupResponse>();
    result.isSucceed = false;
    try {
      const createdUser = await this.authenticationService.signup(user);
      if(createdUser) {
        res.cookie('refreshToken', createdUser.refreshToken, { httpOnly: true });
        result.result = createdUser.user;
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
  async refreshTokens(@Request() req, @Response({ passthrough: true }) res): Promise<OperationResult<string>> {
    const result = new OperationResult<string>();
    result.isSucceed = false;
    try {
      const userId = req.user.userId;
      const tokens = await this.authenticationService.refreshTokens(userId, req.cookies['refreshToken']);
      result.isSucceed = true;
      res.cookie('refreshToken', tokens.refreshToken);
      result.result = tokens.access_token;
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