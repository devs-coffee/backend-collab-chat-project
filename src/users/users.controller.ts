import { Controller, Get, Post, Body, Patch, Param, Delete, HttpException, BadRequestException, Logger } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { ApiTags, ApiCreatedResponse, ApiOkResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { UserEntity } from './entities/user.entity';
import { OperationResult } from '../core/OperationResult';
import { Mapper } from '../core/mapper';

@Controller('users')
@ApiTags('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}
  private readonly mapper = new Mapper();

  @Post()
  @ApiCreatedResponse({ type: UserEntity })
  @ApiBadRequestResponse({ type : BadRequestException})
  async create(@Body() createUserDto: CreateUserDto) : Promise<OperationResult<CreateUserDto>> {
    try {
      const result = new OperationResult<CreateUserDto>();
      result.isSucceed = false;

      const createdUser = await this.usersService.create(createUserDto);
      if(createdUser) {
        result.isSucceed = true;
        result.result = this.mapper.userEntityToDto(createdUser) ;
      }

      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException("an error occured");
    }
  }

  @Get()
  @ApiOkResponse({ type: UserEntity, isArray: true })
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  @ApiOkResponse({ type: UserEntity })
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOkResponse({ type: UserEntity })
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @ApiOkResponse({ type: UserEntity })
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }
}
