import { Mapper } from '@automapper/core';
import { InjectMapper } from '@automapper/nestjs';
import { BadRequestException, Body, Controller, Delete, Get, Logger, Param, Post, Put, Query, Request, UseGuards } from '@nestjs/common';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../authentication/jwt-auth.guard';
import { errorConstant } from '../constants/errors.constants';
import { OperationResult } from '../core/OperationResult';
import { MessageDto } from '../dtos/messages/create-message.dto';
import { UpdateMessageDto } from '../dtos/messages/update.message.dto';
import { MessageEntity } from './entities/message.entity';
import { MessagesService } from './messages.service';
import { NotFoundError } from '@prisma/client/runtime';

@Controller('messages')
@ApiTags('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService, @InjectMapper() private readonly mapper: Mapper) {}

  /**
   * Get the messages from a channel
   * @param id id of channel
   * @param offset id of message to start from
   * @returns a list of messages
   */
  @UseGuards(JwtAuthGuard)
  @Get(":channelId")
  @ApiCreatedResponse({ type: MessageDto, isArray : true })
  @ApiBadRequestResponse({ type : BadRequestException})
  async getMessages(@Param("channelId") id : string, @Query("offset") offset? : string | undefined) : Promise<OperationResult<MessageDto[]>> {
    const result = new OperationResult<MessageDto[]>();
    result.isSucceed = false;
    try {
      const messages = await this.messagesService.getMyMessagesByChannelId(id, offset);
      result.isSucceed = true;
      result.result = this.mapper.mapArray(messages, MessageEntity, MessageDto);
      return result;
    } catch (error) {
        Logger.log(error);
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Create a message
   * @param message message to create
   * @returns the created message
   */
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
        result.result = this.mapper.map(createdMessage, MessageEntity, MessageDto);
      } else {
        throw new BadRequestException(errorConstant.serverNotCreated);
      }
      return result;
    } catch (error) {
        Logger.log(error);
        if(error instanceof NotFoundError) {
          throw new BadRequestException(errorConstant.userNotServerMember);
        }
        throw new BadRequestException(errorConstant.errorOccured);
    }
  }

  /**
   * Update a message
   * @param messageId id of message to update 
   * @param updateMessageDto data to update
   * @returns the new message's data
   */
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

  /**
   * Delete a message by id
   * @param id id of message to delete
   * @returns true if message is deleted, false otherWhise
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
      response.result = await this.messagesService.remove(id, req.user.id);
      return response;
    } catch (error) {
      Logger.log(error);
      throw new BadRequestException(errorConstant.errorOccured);
    }
  }
}