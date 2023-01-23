import { Controller, Get, Body, Patch, Param, Request, Delete, BadRequestException, Logger, UseGuards, Post, Put } from '@nestjs/common';
import { ApiTags, ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { ChannelDto } from '../dtos/channels/channel.dto';
import { ChannelEntity } from './entities/channel.entity';
import { ServerEntity } from '../servers/entities/server.entity';
import { ChannelServerDto } from '../dtos/channels/channel.server.dto';
import { ServerChannelEntity } from '../servers/entities/server.channels.entity';
import { UpdateChannelDto } from '../dtos/channels/update.channel.dto';
import { CreateChannelEntity } from './entities/create.channel.entity';

@Controller('channels')
@ApiTags('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService, @InjectMapper() private readonly mapper: Mapper) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  @ApiCreatedResponse({ type: ChannelDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async createChannel(@Body() channel: ChannelDto, @Request() req) : Promise<OperationResult<ChannelDto>> {
    const result = new OperationResult<ChannelDto>();
    result.isSucceed = false;
    try {
      const channelToCreate = this.mapper.map(channel, ChannelDto, CreateChannelEntity);
      const createdChannel = await this.channelService.create(channelToCreate);
      if(createdChannel) {
        result.isSucceed = true;
        result.result = this.mapper.map(createdChannel, CreateChannelEntity, ChannelDto);
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
  @Get("@me")
  @ApiCreatedResponse({ type: ChannelDto, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async getUserChannels(@Request() req) : Promise<OperationResult<ChannelDto[]>> {
    const result = new OperationResult<ChannelDto[]>();
    result.isSucceed = false;
    try {
      const channels = await this.channelService.findChannelsByUserId(req.user.id);
      result.isSucceed = true;
      result.result = this.mapper.mapArray(channels, ChannelEntity, ChannelDto);
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":serverid")
  @ApiCreatedResponse({ type: ChannelServerDto, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async getChannels(@Param('serverid') id: string) : Promise<OperationResult<ChannelServerDto>> {
    const result = new OperationResult<ChannelServerDto>();
    result.isSucceed = false;
    try {
      const channels = await this.channelService.findChannelsByServerId(id);
      if(channels) {
        result.isSucceed = true;
        result.result = this.mapper.map(channels, ServerChannelEntity, ChannelServerDto);
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
  @Get(":channelId")
  @ApiCreatedResponse({ type: ServerEntity, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async updateChannels(@Param('channelId') id: string) : Promise<OperationResult<ServerEntity>> {
    const result = new OperationResult<ServerEntity>();
    result.isSucceed = false;
    try {
      const channels = await this.channelService.findChannelsByServerId(id);
      if(channels) {
        result.isSucceed = true;
        result.result = channels;
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
  @Put(":channelId")
  @ApiCreatedResponse({ type: UpdateChannelDto })
  @ApiBadRequestResponse({ type : BadRequestException})
  async update(@Param('channelId') channelId: string, @Body() updateChannelDto: UpdateChannelDto, @Request() req) {
    const result = new OperationResult<UpdateChannelDto>();
    result.isSucceed = false;
    try {
      const channelToUpdate = this.mapper.map(updateChannelDto, UpdateChannelDto, CreateChannelEntity)
      const updatedChannel = await this.channelService.update(channelId, channelToUpdate);
      if(updatedChannel) {
        result.isSucceed = true;
        result.result = this.mapper.map(updatedChannel, CreateChannelEntity, ChannelDto);
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
      response.result = await this.channelService.remove(id, req.user.id);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

}
