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
import { UserEntity } from '../users/entities/user.entity';
import { UserDto } from 'src/dtos/users/user.dto';
import { UserChannel } from '@prisma/client';
import { ServerEntity } from '../servers/entities/server.entity';
import { UserChannelDto } from 'src/dtos/channels/channel.user.dto';
import { UserChannelEntity } from './entities/userChannel.entity';

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
    @Get(":id")
    @ApiCreatedResponse({ type: ChannelEntity, isArray : true })
    @ApiBadRequestResponse({ type : BadRequestException})
    async getUserChannels(@Request() req, @Param('id') id: string) : Promise<OperationResult<ChannelEntity[]>> {
      const result = new OperationResult<ChannelEntity[]>();
      result.isSucceed = false;
      try {
        const channels = await this.channelService.findChannelsByUserId(id);
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

}
