import { Controller, Get, Body, Patch, Param, Request, Delete, BadRequestException, Logger, UseGuards, Post, Put } from '@nestjs/common';
import { MessagesService } from './messages.service';
import { ApiTags, ApiBadRequestResponse, ApiCreatedResponse } from '@nestjs/swagger';
import { OperationResult } from '../core/OperationResult';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { errorConstant } from '../constants/errors.constants';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { MessageCreateEntity } from './entities/message.create.entity';
import { MessageEntity } from './entities/message.entity';
import { UpdateMessageDto } from '../dtos/messages/update.message.dto';
import { UpdateServerDto } from 'src/dtos/servers/update-server.dto';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService, @InjectMapper() private readonly mapper: Mapper) {}

  @UseGuards(JwtAuthGuard)
  @Get(":channelId")
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
    async createMessage(@Body() message: MessageDto, @Request() req) : Promise<OperationResult<MessageDto>> {
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

    @UseGuards(JwtAuthGuard)
    @Put(":messageId")
    @ApiCreatedResponse({ type: UpdateMessageDto })
    @ApiBadRequestResponse({ type : BadRequestException})
    async update(@Param('messageId') messageId: string, @Body() updateMessageDto: UpdateMessageDto, @Request() req) {
      const result = new OperationResult<UpdateMessageDto>();
      result.isSucceed = false;
      try {
        updateMessageDto.userId = req.user.id;
        const messageToUpdate = this.mapper.map(updateMessageDto, UpdateMessageDto, MessageEntity)
        const updatedMessage = await this.messagesService.update(messageId, messageToUpdate);
        if(updatedMessage) {
          result.isSucceed = true;
          result.result = this.mapper.map(updatedMessage, MessageEntity, MessageDto);
        } else {
          result.result = null;
        }
  
        return result;
      } catch (error) {
          Logger.log(error);
          throw new BadRequestException(errorConstant.errorOccured);
      }
    }

}
