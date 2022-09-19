import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './local-auth.gard';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { errorConstant } from '../constants/errors.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { LoginSignupResponse } from '../dtos/users/login-signup-response.dto';
import { UserEntity } from '../users/entities/user.entity';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService,  @InjectMapper() private readonly mapper: Mapper){}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: LoginSignupResponse })
  @ApiBadRequestResponse({ type : BadRequestException})
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
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }
}
