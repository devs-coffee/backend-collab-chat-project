import { Test, TestingModule } from '@nestjs/testing';
import { PrismaModule } from '../prisma/prisma.module';
import { UsersService } from './users.service';
import { AutomapperModule, getMapperToken } from '@automapper/nestjs';
import { createMapper, Mapper } from '@automapper/core';
import { classes } from '@automapper/classes';

describe('UsersService', () => {
  let service: UsersService;
  let mapper: Mapper;
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UsersService, { provide: getMapperToken(), useValue: createMapper({
        strategyInitializer: classes(),
      }), 
    }],
      imports: [PrismaModule, AutomapperModule],
    }).compile();

    service = module.get<UsersService>(UsersService);
    mapper = module.get<Mapper>(getMapperToken())
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
