import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Logger } from '@nestjs/common';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { Mapper } from '../core/mapper';
import { AuthenticationService } from './authentication.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';

@Controller('auth')
@ApiTags('auth')
export class AuthenticationController {
  constructor(private readonly authenticationService: AuthenticationService, private readonly mapper: Mapper) {}

  @Post()
  @ApiCreatedResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async create(@Body() createUserDto: CreateUserDto) : Promise<OperationResult<CreateUserDto>> {
    const result = new OperationResult<CreateUserDto>();
    result.isSucceed = false;
    try {
      const createdUser = await this.authenticationService.signup(createUserDto);
      if(createdUser) {
        result.isSucceed = true;
        result.result = this.mapper.userEntityToDto(createdUser) as CreateUserDto;
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
