import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './local-auth.gard';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { errorConstant } from '../constants/errors.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from '../dtos/users/user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService,  @InjectMapper() private readonly mapper: Mapper){}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: Object })
  @ApiBadRequestResponse({ type : BadRequestException})
  async login(@Request() req) : Promise<OperationResult<Object>> {
    const result = new OperationResult<Object>();
    result.isSucceed = false;

    try {
      result.isSucceed = true;
      const response = req.user;
      response.user = this.mapper.map(response.user, UserEntity, UserDto);
      result.result = response;
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @Post('signup')
  @ApiCreatedResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async signup(@Body() user: CreateUserDto) : Promise<OperationResult<CreateUserDto>> {
    const result = new OperationResult<CreateUserDto>();
    result.isSucceed = false;
    try {
      const createdUser = await this.authenticationService.signup(user);
      if(createdUser) {
        result.isSucceed = true;
        result.result = this.mapper.map(createdUser, UserEntity, UserDto);
      } else {
        result.result = null;
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
