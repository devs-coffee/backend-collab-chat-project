import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { Mapper } from '../core/mapper';
import { AuthenticationController } from './authentication.controller';
import { AuthenticationService } from './authentication.service';

@Module({
  controllers: [AuthenticationController],
  providers: [AuthenticationService, Mapper],
  imports: [PrismaModule],
})
export class AuthenticationModule {}
