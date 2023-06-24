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
import { PrismaClient, PrismaPromise, User } from '@prisma/client';
import { randomUUID } from 'crypto';
import { mockDeep, DeepMockProxy } from 'jest-mock-extended';
import { PrismaService } from '../prisma/prisma.service';
import { MockContext, Context, createMockContext } from '../../context'


describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let mockCtx: MockContext
let ctx: Context
  beforeEach(async () => {
    mockCtx = createMockContext()
    ctx = mockCtx as unknown as Context
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


  describe('findAll', () => {
    it('should return an array of users', async () => {
      const users: User[] = [];
      const user: User = {
        id: randomUUID(),
        pseudo: 'Rich',
        email: 'hello@prisma.io',
        password: '1234',
        picture: '',
        createdAt: new Date(Date.now()),
        updatedAt: new Date(Date.now())
      }
      users.push(user);
      mockCtx.prisma.user.findMany.mockResolvedValue(users);
      const userDto = new OperationResult<UserDto[]>();
      expect(await controller.findAll('1')).resolves.toEqual(
        userDto.isSucceed = true,
        // userDto.result = this.mapper.map()

      );
    });
  });

});

