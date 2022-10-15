import { Injectable } from '@nestjs/common';
import { SigninUserDto } from '../dtos/users/signin-user-dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import * as bcrypt from 'bcrypt';
import { errorConstant } from '../constants/errors.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserEntity } from './entities/user.entity';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}

  create(user: CreateUserDto) {
    return this.prisma.user.create({ data: user});
  }

  findAll() {
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id }});
  }

  findByEmail(signinUserDto: SigninUserDto) {
    return this.prisma.user.findFirst({ where: {email : signinUserDto.email }});
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    if(updateUserDto.password){
      const user = await this.findOne(id);
      if(user){
        const match = await bcrypt.compare(updateUserDto.oldPassword, user.password);
        if(match){
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        } else {
          throw new Error(errorConstant.passwordNotMatching);
        }
      }
    }

    const userEntity = this.mapper.map(updateUserDto, UpdateUserDto, UserEntity);
    return this.prisma.user.update({
      where: { id },
      data: userEntity,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }

  findAllUsersByServerId(serverId: string){
    return this.prisma.user.findMany({where: { servers : { some : { serverId }}}, orderBy: { pseudo : 'asc'}});
  }
}
