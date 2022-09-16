import { Controller, Get, Post, Body, Patch, Param, Delete, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { Mapper } from '../core/mapper';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService, private readonly mapper: Mapper) {}

  @Post()
  @ApiCreatedResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async create(@Body() createUserDto: CreateUserDto) : Promise<OperationResult<CreateUserDto>> {
    const result = new OperationResult<CreateUserDto>();
    result.isSucceed = false;
    try {
      const createdUser = await this.usersService.create(createUserDto);
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

  @Get()
  @ApiOkResponse({ type: CreateUserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException})
  async findAll() : Promise<OperationResult<CreateUserDto[]>> {
    const response = new OperationResult<CreateUserDto[]>();
    response.isSucceed = false;
    try {
      const users = await this.usersService.findAll();
      if(users && users.length > 0) {
        response.isSucceed = true;
        response.result = this.mapper.userEntityToDto(users) as CreateUserDto[];
      } else {
        response.result = [];
      }

      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException("An error occured", error);
    }

  }

  @Get(':id')
  @ApiOkResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async findOne(@Param('id') id: string) {
    const response = new OperationResult<CreateUserDto>();
    response.isSucceed = false;
    try {
      const user = await this.usersService.findOne(id);
      if(user) {
        response.isSucceed = true;
        response.result = this.mapper.userEntityToDto(user) as CreateUserDto;
      } else {
        response.result = null;
      }

      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException("An error occured", error);
    }
  }

  @Patch(':id')
  @ApiOkResponse({ type: CreateUserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = new OperationResult<CreateUserDto>();
    result.isSucceed = false;
    try {
      const createdUser = await this.usersService.update(id, updateUserDto);
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
      throw new BadRequestException("An error occured", error);
    }
  }
}
