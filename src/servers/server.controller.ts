import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { errorConstant } from '../constants/errors.constants';
import { OperationResult } from '../core/OperationResult';
import { FullServerDto } from '../dtos/servers/fullServer.dto';
import { ServerDto } from '../dtos/servers/server.dto';
import { UpdateServerDto } from '../dtos/servers/update-server.dto';
import { UserServerDto } from '../dtos/userServers/user-servers-dto';
import { UserDto } from '../dtos/users/user.dto';
import { UserEntity } from '../users/entities/user.entity';
import { UsersService } from '../users/users.service';
import { ServerEntity } from './entities/server.entity';
import { UserServerEntity } from './entities/user-server-entity';
import { ServerService } from './server.service';

@Controller('servers')
@ApiTags('servers')
export class ServerController {
  constructor(private readonly serverService: ServerService, @InjectMapper() private readonly mapper: Mapper, private readonly userService: UsersService) {}

  /**
   * Get a list of servers
   * @returns Server[]
   */
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
      response.result = servers;
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Get all the users of a given server
   * @param serverId id of server
   * @returns a list of users
   */
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

  /**
   * Search a server by name or keyword
   * @param keyword 
   * @returns a list of servers
   */
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
      if(error instanceof BadRequestException){
        throw error;
      }
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Create a server
   * @param server data to create the server
   * @returns the new server's data
   */
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
        result.result = createdServer;
        //result.result = this.mapper.map(createdServer, ServerEntity, ServerDto);
      } else {
        throw new BadRequestException(errorConstant.serverNotCreated);
      }
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Request to join or leave a server
   * @param joinRequest id of server to join or leave
   * @returns true if server is joined, false if left
   */
  @UseGuards(JwtAuthGuard)
  @Post("join")
  @ApiCreatedResponse({ type: Boolean })
  @ApiBadRequestResponse({ type : BadRequestException })
  async joinOrLeave(@Body() joinRequest: JoinServerRequestDto, @Request() req) : Promise<OperationResult<boolean>> {
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
        if(error instanceof BadRequestException) {
          throw error;
        }
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Get a server by id
   * @param id id of server
   * @returns the server
   */
  @UseGuards(JwtAuthGuard)
  @Get(':id')
  @ApiOkResponse({ type: ServerDto })
  @ApiBadRequestResponse({type: BadRequestException})
  async findOne(@Param('id') id: string, @Request() req) {
    const response = new OperationResult<FullServerDto>();
    response.isSucceed = false;
    try {
      const server = await this.serverService.findOne(id, req.user.id);
      response.isSucceed = true;
      response.result = server;
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Update a server
   * @param id id of server
   * @param updateServerDto data tu update server
   * @returns the new server's data
   */
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
        result.result = updatedServer;
        //result.result = this.mapper.map(updatedServer, ServerEntity, ServerDto);
      } else {
        result.result = null;
      }
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Delete a server by id
   * @param id id of server
   * @returns true if server is deleted, false otherwhise
   */
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