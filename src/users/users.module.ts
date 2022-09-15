import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { PrismaModule } from '../prisma/prisma.module';
import { Mapper } from '../core/mapper';

@Module({
  controllers: [UsersController],
  providers: [UsersService, Mapper],
  imports: [PrismaModule],
})
export class UsersModule {}
