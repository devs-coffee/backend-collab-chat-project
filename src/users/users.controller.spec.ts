import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMapper } from '@automapper/core';
import { getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { OperationResult } from '../core/OperationResult';
import { UserDto } from '../dtos/users/user.dto';
import { errorConstant } from '../constants/errors.constants';
import { BadRequestException } from '@nestjs/common';
import { PrismaPromise, User } from '@prisma/client';
import { randomUUID } from 'crypto';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [UsersService, { provide: getMapperToken(), useValue: createMapper({
        strategyInitializer: classes(),
      }), 
    }],
      imports: [PrismaModule]
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

});

