import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { errorConstant } from '../constants/errors.constants';
import { OperationResult } from '../core/OperationResult';
import { ChannelDto } from '../dtos/channels/channel.dto';
import { ChannelServerDto } from '../dtos/channels/channel.server.dto';
import { UpdateChannelDto } from '../dtos/channels/update.channel.dto';
import { UserChannelDto } from '../dtos/userChannels/user-channel-dto';
import { ServerChannelEntity } from '../servers/entities/server.channels.entity';
import { ChannelService } from './channel.service';
import { CreateChannelEntity } from './entities/create.channel.entity';
import { UserChannelEntity } from './entities/userChannel.entity';

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
  @Post("join")
  @ApiCreatedResponse({ type: Boolean })
  @ApiBadRequestResponse({ type: BadRequestException })
  async joinOrLeave(@Body() joinRequest: JoinChannelRequestDto, @Request() req) : Promise<OperationResult<boolean>> {
    const result = new OperationResult<boolean>();
    result.isSucceed = false;
    const dto = {
      ...joinRequest,
      userId: req.user.id
    }
    try {
      const channelToJoinOrLeave = this.mapper.map(dto, UserChannelDto, UserChannelEntity);
      const joined = await this.channelService.joinOrLeave(channelToJoinOrLeave);
      result.isSucceed = true;
      result.result = joined;
      return result;
    } catch(error) {
      if(error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get("@me")
  @ApiCreatedResponse({ type: ChannelDto, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async getUserPrivateChannels(@Request() req) : Promise<OperationResult<ChannelDto[]>> {
    const result = new OperationResult<any[]>();
    result.isSucceed = false;
    try {
      const channels = await this.channelService.findPrivateChannelsByUserId(req.user.id);
      result.isSucceed = true;
      result.result = channels;
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  @UseGuards(JwtAuthGuard)
  @Get(":serverid")
  @ApiOkResponse({ type: ChannelServerDto, isArray : true })
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
  @Put(":channelId")
  @ApiCreatedResponse({ type: UpdateChannelDto })
  @ApiBadRequestResponse({ type : BadRequestException })
  async update(@Param('channelId') channelId: string, @Body() updateChannelDto: UpdateChannelDto, @Request() req) {
    const result = new OperationResult<UpdateChannelDto | null>();
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
  @Put(":channelId/isRead")
  @ApiOkResponse({type: Boolean})
  @ApiBadRequestResponse({ type: BadRequestException })
  async putAsRead(@Param('channelId') channelId: string, @Request() req) {
    const response = new OperationResult<boolean>();
    response.isSucceed = false;
    try {
      response.isSucceed = true;
      response.result = await this.channelService.putAsRead(channelId, req.user.id);
      return response;
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
