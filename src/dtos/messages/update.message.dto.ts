import { AutoMap } from '@automapper/classes';
import { PartialType } from '@nestjs/swagger';
import { MessageDto } from './create-message.dto';

export class UpdateMessageDto extends PartialType(MessageDto) {
    @AutoMap()
    content?: string;
}
