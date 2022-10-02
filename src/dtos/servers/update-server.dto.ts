import { PartialType } from '@nestjs/swagger';
import { ServerDto } from './server.dto';

export class UpdateServerDto extends PartialType(ServerDto) {}
