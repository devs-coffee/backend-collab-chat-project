import { Controller, Get, Body, Patch, Param, Request, Delete, BadRequestException, Logger, UseGuards, Post } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiTags, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { MessageCreateEntity } from './entities/message.create.entity';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService, @InjectMapper() private readonly mapper: Mapper) {}

  @UseGuards(JwtAuthGuard)
  @Get(":id")
  @ApiCreatedResponse({ type: MessageDto, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async getMessages(@Param("id") id : string) : Promise<OperationResult<MessageDto[]>> {
    const result = new OperationResult<MessageDto[]>();
    result.isSucceed = false;
    try {
      const messages = await this.messagesService.getMyMessagesByChannelId(id);
      result.isSucceed = true;
      result.result = this.mapper.mapArray(messages, MessageCreateEntity, MessageDto);
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }
    @UseGuards(JwtAuthGuard)
    @Post()
    @ApiCreatedResponse({ type: MessageDto })
    @ApiBadRequestResponse({ type : BadRequestException})
    async createServer(@Body() message: MessageDto, @Request() req) : Promise<OperationResult<MessageDto>> {
      const result = new OperationResult<MessageDto>();
      result.isSucceed = false;
      try {
        const createdMessage = await this.messagesService.create({...message, userId: req.user.id});
        if(createdMessage) {
          result.isSucceed = true;
          result.result = this.mapper.map(createdMessage, MessageCreateEntity, MessageDto);
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
