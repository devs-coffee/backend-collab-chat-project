import { Controller, Get, Body, Patch, Param, Request, Delete, BadRequestException, Logger, UseGuards, Post } from '@nestjs/common';
import { ApiTags, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { ChannelService } from './channel.service';
import { ChannelDto } from '../dtos/channels/channel.dto';
import { ChannelEntity } from './entities/channel.entity';
import { ServerEntity } from '../servers/entities/server.entity';

@Controller('channels')
@ApiTags('channels')
export class ChannelController {
  constructor(private readonly channelService: ChannelService, @InjectMapper() private readonly mapper: Mapper) {}

    // @UseGuards(JwtAuthGuard)
    // @Get(":serverid")
    // @ApiCreatedResponse({ type: ServerEntity, isArray : true })
    // @ApiBadRequestResponse({ type : BadRequestException})
    // async getChannels(@Request() req, @Param('serverid') id: string) : Promise<OperationResult<ServerEntity>> {
    //   const result = new OperationResult<ServerEntity>();
    //   result.isSucceed = false;
    //   try {
    //     const channels = await this.channelService.findChannelsByServerId(id);
    //     if(channels) {
    //       result.isSucceed = true;
    //       result.result = channels;
    //     } else {
    //       throw new BadRequestException(errorConstant.serverNotCreated);
    //     }
    //     return result;
    //   } catch (error) {
    //       Logger.log(error);
    //       throw new BadRequestException(errorConstant.errorOccured);
    //   }
    // }

    @UseGuards(JwtAuthGuard)
    @Get("me")
    @ApiCreatedResponse({ type: ChannelDto, isArray : true })
    @ApiBadRequestResponse({ type : BadRequestException})
    async getUserChannels(@Request() req) : Promise<OperationResult<ChannelDto[]>> {
      const result = new OperationResult<ChannelDto[]>();
      result.isSucceed = false;
      try {
        const channels = await this.channelService.findChannelsByUserId(req.user.id);
        if(channels) {
          result.isSucceed = true;
          result.result = this.mapper.mapArray(channels, ChannelEntity, ChannelDto);
        } else {
          throw new BadRequestException(errorConstant.cannotGetUserChannels);
        }
        return result;
      } catch (error) {
          Logger.log(error);
          throw new BadRequestException(errorConstant.errorOccured);
      }
    }

}
