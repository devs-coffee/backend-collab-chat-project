import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { createMapper, Mapper } from '@automapper/core';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { classes } from '@automapper/classes';
import { OperationResult } from '../core/OperationResult';
import { UserDto } from '../dtos/users/user.dto';
import { User } from '@prisma/client';
import { AutoMapping } from '../core/automapping';

describe('UsersController', () => {
  let controller: UsersController;
  let usersService: UsersService;
  let mapper: Mapper;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [PrismaModule, AutomapperModule],
      controllers: [UsersController],
      providers: [UsersService,
        AutoMapping, { 
        provide: getMapperToken(), 
        useValue: createMapper({
        strategyInitializer: classes(),
      }),
    }],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    usersService = module.get<UsersService>(UsersService);
    mapper = module.get<Mapper>(getMapperToken());
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(usersService).toBeDefined();
    expect(mapper).toBeDefined();
  });


    it('should return an array of users', async () => {
      jest.spyOn(usersService, 'findAll').mockResolvedValue(USERSENTITY);
      const userDto: OperationResult<UserDto[]> = {
        isSucceed: true,
        result: USERS
      };
      expect(await controller.findAll('1c23dffd-cdf0-4e6b-95b9-be24e76d4815,85bc066f-5edb-4efd-b86c-bc50c7554135')).toEqual(
        userDto
      );
    });
  });

const USERS: UserDto[] = [
  {
    id: '1c23dffd-cdf0-4e6b-95b9-be24e76d4815',
    pseudo: 'test jbo',
    picture: ''
  },
  {
    id: '85bc066f-5edb-4efd-b86c-bc50c7554135',
    pseudo: 'test jbo 1',
    picture: ''
  }
];


const USERSENTITY: User[] = [
  {
    id: '1c23dffd-cdf0-4e6b-95b9-be24e76d4815',
    pseudo: 'test jbo',
    picture: '',
    password: 'Test1234!',
    email: 'testjbo@test.com',
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  },
  {
    id: '85bc066f-5edb-4efd-b86c-bc50c7554135',
    pseudo: 'test jbo 1',
    picture: '',
    password: 'Test1234!',
    email: 'testjbo1@test.com',
    createdAt: new Date(Date.now()),
    updatedAt: new Date(Date.now())
  }
];