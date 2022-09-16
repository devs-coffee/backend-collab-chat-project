import { Controller, Post, Body, BadRequestException, Logger, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { AuthenticationService } from './authentication.service';
import { LocalAuthGuard } from './local-auth.gard';
import { CreateUserDto } from '../dtos/users/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService){}

  @UseGuards(LocalAuthGuard)
  @Post('login')
  @ApiOkResponse({ type: String })
  @ApiBadRequestResponse({ type : BadRequestException})
  async login(@Request() req) : Promise<OperationResult<string>> {
    const result = new OperationResult<string>();
    result.isSucceed = false;

    try {
      result.isSucceed = true;
      result.result = req.user;
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException("an error occured");
    }
  }

  @Post('signup')
  @ApiCreatedResponse({ type: String })
  @ApiBadRequestResponse({ type : BadRequestException})
  async signup(@Body() user: CreateUserDto) : Promise<OperationResult<string>> {
    const result = new OperationResult<string>();
    result.isSucceed = false;
    try {
      const createdUser = await this.authenticationService.signup(user);
      if(createdUser) {
        result.isSucceed = true;
        result.result = "user authenticated";
      } else {
        result.result = null;
      }
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException("an error occured");
    }
  }
}
