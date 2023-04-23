import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Put, Query, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { errorConstant } from '../constants/errors.constants';
import { OperationResult } from '../core/OperationResult';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { UserDto } from '../dtos/users/user.dto';
import { UserEntity } from './entities/user.entity';
import { UsersService } from './users.service';

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
  @Put(':id')
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
        if(error instanceof PrismaClientKnownRequestError  && error.message.includes("Unique constraint failed on the fields: (`pseudo`)")) {
          throw new BadRequestException(errorConstant.pseudoUnavailable);
        }
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
