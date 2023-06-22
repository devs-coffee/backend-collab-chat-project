import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { getMapperToken } from '@automapper/nestjs';
import { createMapper } from '@automapper/core';
import { classes } from '@automapper/classes';

describe('UsersService', () => {
  let service: UsersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getMapperToken(), useValue: createMapper({
        strategyInitializer: classes(),
      }), 
    }],
      imports: [PrismaModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
