import { Controller, Get, Body, Patch, Param, Delete, BadRequestException, Logger, UseGuards, Query } from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { ApiTags, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserDto } from '../dtos/users/user.dto';
import { UserEntity } from './entities/user.entity';
import { errorConstant } from '../constants/errors.constants';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, @InjectMapper() private readonly mapper: Mapper) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async findAll() : Promise<OperationResult<UserDto[]>> {
    const response = new OperationResult<UserDto[]>();
    response.isSucceed = false;
    try {
      const users = await this.usersService.findAll();
      if(users && users.length > 0) {
        response.isSucceed = true;
        response.result = this.mapper.mapArray(users, UserEntity, UserDto);
      } else {
        response.result = [];
      }

      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("searchUser")
  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async search(@Query("name") name) : Promise<OperationResult<UserDto[]>> {
    const response = new OperationResult<UserDto[]>();
    response.isSucceed = false;
    try {
      const users = await this.usersService.searchUser(name.toLowerCase());
      response.isSucceed = true;
      response.result = this.mapper.mapArray(users, UserEntity, UserDto);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async findOne(@Param('id') id: string) {
    const response = new OperationResult<UserDto>();
    response.isSucceed = false;
    try {
      const user = await this.usersService.findOne(id);
      if(user) {
        response.isSucceed = true;
        response.result = this.mapper.map(user, UserEntity, UserDto);
      } else {
        response.result = null;
      }

      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = new OperationResult<UserDto>();
    result.isSucceed = false;
    try {
      const updatedUser = await this.usersService.update(id, updateUserDto);
      if(updatedUser) {
        result.isSucceed = true;
        result.result = this.mapper.map(updatedUser, UserEntity, UserDto);
      } else {
        result.result = null;
      }

      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  @ApiOkResponse({ type: Boolean })
  @ApiBadRequestResponse({type: BadRequestException})
  async remove(@Param('id') id: string) {
    const response = new OperationResult<boolean>();
    response.isSucceed = false;
    try {
      await this.usersService.remove(id);
      response.isSucceed = true;
      response.result = true;
      return response;

    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }
}
