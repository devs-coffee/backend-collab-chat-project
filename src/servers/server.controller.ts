import { Controller, Get, Body, Param, Delete, Request, BadRequestException, Logger, UseGuards, Post, Put, Query } from '@nestjs/common';
import { ApiTags, ApiOkResponse, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { ServerEntity } from './entities/server.entity';
import { errorConstant } from '../constants/errors.constants';
import { ServerService } from './server.service';
import { ServerDto } from '../dtos/servers/server.dto';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { UsersService } from '../users/users.service';
import { UserDto } from '../dtos/users/user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { UserServerEntity } from './entities/user-server-entity';

@Controller('servers')
@ApiTags('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService, @InjectMapper() private readonly mapper: Mapper, private readonly userService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get()
  @ApiOkResponse({ type: ServerDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async GetAllUserServers(@Request() req) : Promise<OperationResult<ServerDto[]>> {
    const response = new OperationResult<ServerDto[]>();
    response.isSucceed = false;
    try {
      const servers = await this.serverService.findAll(req.user.id);
      response.isSucceed = true;
      response.result = this.mapper.mapArray(servers, ServerEntity, ServerDto);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":serverId/users")
  @ApiOkResponse({ type: UserDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async GetAllUserByServerId(@Request() req, @Param('serverId') serverId: string) : Promise<OperationResult<UserDto[]>> {
    const response = new OperationResult<UserDto[]>();
    response.isSucceed = false;
    try {
      const users = await this.userService.findAllUsersByServerId(serverId);
      response.isSucceed = true;
      response.result = this.mapper.mapArray(users, UserEntity, UserDto);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("search")
  @ApiOkResponse({ type: ServerDto, isArray: true })
  @ApiBadRequestResponse({type: BadRequestException })
  async Search(@Query("keyword") keyword: string) : Promise<OperationResult<ServerDto[]>> {
    const response = new OperationResult<ServerDto[]>();
    response.isSucceed = false;
    try {
      const servers = await this.serverService.search(keyword.toLowerCase());
      response.isSucceed = true;
      response.result = this.mapper.mapArray(servers, ServerEntity, ServerDto);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: ServerDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async createServer(@Body() server: ServerDto, @Request() req) : Promise<OperationResult<ServerDto>> {
    const result = new OperationResult<ServerDto>();
    result.isSucceed = false;
    try {
      const createdServer = await this.serverService.create({...server, userId: req.user.id});
      if(createdServer) {
        result.isSucceed = true;
        result.result = this.mapper.map(createdServer, ServerEntity, ServerDto);
      } else {
        throw new BadRequestException(errorConstant.serverNotCreated);
      }
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Post("join")
  @ApiCreatedResponse({ type: Boolean })
  @ApiBadRequestResponse({ type : BadRequestException})
  async joinOrLeave(@Body() joinRequest: JoinRequestDto, @Request() req) : Promise<OperationResult<boolean>> {
    const result = new OperationResult<boolean>();
    result.isSucceed = false;
    const dto = {
      ...joinRequest,
      userId: req.user.id,
      isAdmin: false
    }
    try {
      const serverToJoinOrLeave = this.mapper.map(dto, UserServerDto, UserServerEntity);
      const joined = await this.serverService.joinOrLeave(serverToJoinOrLeave);
      result.isSucceed = true;
      result.result = joined;
      return result;
    } catch (error) {
        error instanceof BadRequestException ? 
          () =>{throw error}
          :
          () =>{throw new BadRequestException(errorConstant.errorOccured)};
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: ServerDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async findOne(@Param('id') id: string, @Request() req) {
    const response = new OperationResult<ServerDto>();
    response.isSucceed = false;
    try {
      const server = await this.serverService.findOne(id, req.user.id);
      response.isSucceed = true;
      response.result = this.mapper.map(server, ServerEntity, ServerDto);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Put(':id')
  @ApiOkResponse({ type: UpdateServerDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async update(@Param('id') id: string, @Body() updateServerDto: UpdateServerDto, @Request() req) {
    const result = new OperationResult<UpdateServerDto>();
    result.isSucceed = false;
    try {
      updateServerDto.userId = req.user.id;
      const updatedServer = await this.serverService.update(id, updateServerDto);
      if(updatedServer) {
        result.isSucceed = true;
        result.result = this.mapper.map(updatedServer, ServerEntity, ServerDto);
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
  async remove(@Request() req, @Param('id') id: string) {
    const response = new OperationResult<boolean>();
    response.isSucceed = false;
    try {
      response.isSucceed = true;
      response.result = await this.serverService.remove(id, req.user.id);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }
}
