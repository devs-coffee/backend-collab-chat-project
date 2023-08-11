import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library';
import { PrefsDto } from 'src/dtos/users/prefs.dto';
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
  private logger: Logger = new Logger('userController');

  
  constructor(private readonly usersService: UsersService, @InjectMapper() private readonly mapper: Mapper) {}

  /**
   * Get a list of users
   * @param idList list of users id, coma separated
   * @returns list of users ( userDto[] )
   */
  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async findAll(@Query("idList") idList?:string) : Promise<OperationResult<UserDto[]>> {
    const response = new OperationResult<UserDto[]>();
    response.isSucceed = false;
    try {
      const users = await this.usersService.findAll(idList);
      if(users && users.length > 0) {
        response.isSucceed = true;
        response.result = this.mapper.mapArray(users, UserEntity, UserDto);
      } else {
        response.isSucceed = true;
        response.result = [];
      }
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Search for users by name
   * @param name pseudo of searched user
   * @returns a list of corresponding users
   */
  @UseGuards(JwtAuthGuard)
  @Get("searchUser")
  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async search(@Query("name") name:string) : Promise<OperationResult<UserDto[]>> {
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

  /**
   * Get a user by id
   * @param id id of user
   * @returns the corresponding user DTO
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async findOne(@Param('id') id: string) {
    const response = new OperationResult<UserDto | null>();
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

  /**
   * Save user preferences
   */
  @UseGuards(JwtAuthGuard)
  @Put('prefs')
  @ApiOkResponse({ type: Boolean })
  @ApiBadRequestResponse({type: BadRequestException})
  async updatePrefs(@Body() prefsDto: PrefsDto, @Request() req) : Promise<OperationResult<PrefsDto | null>> {
    const response = new OperationResult<PrefsDto | null>();
    response.isSucceed = false;
    response.result = null;
    try {
      const serviceResponse = await this.usersService.updatePrefs(req.user.id, prefsDto);
      if(serviceResponse) {
        console.log(serviceResponse);
        response.isSucceed = true;
        response.result = serviceResponse;
      }
      return response;
    } catch (error) {
      if(error instanceof PrismaClientValidationError) {
        if(error.message.includes('Argument colorScheme')) {
          this.logger.log(error.message.substring(error.message.indexOf('Argument')));
          throw new BadRequestException(error.message.substring(error.message.indexOf('Argument')));
        }
        if(error.message.includes('Unknown arg')) {
          this.logger.log(error.message.substring(error.message.indexOf('Unknown arg'), error.message.indexOf('for type UserPrefsUpdateInput') -1));
          throw new BadRequestException(error.message.substring(error.message.indexOf('Unknown arg'), error.message.indexOf('for type UserPrefsUpdateInput') -1));
        }

      }
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * put a user by id
   * @param id id of user to update
   * @param updateUserDto new user's data
   * @returns the new user's data
   */
  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const result = new OperationResult<UserDto | null>();
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

  /**
   * Delete a user
   * @param id id of user to delete
   * @returns true if successfully deleted
   */
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