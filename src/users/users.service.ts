import { BadRequestException, Injectable } from '@nestjs/common';
import { SigninUserDto } from '../dtos/users/signin-user-dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import * as bcrypt from 'bcryptjs';
import { errorConstant } from '../constants/errors.constants';
import { InjectMapper } from '@automapper/nestjs';
import { Mapper } from '@automapper/core';
import { UserEntity } from './entities/user.entity';
import { PrefsDto } from '../dtos/users/prefs.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService, @InjectMapper() private readonly mapper: Mapper)  {}

  create(user: CreateUserDto) {
    return this.prisma.user.create({ data: user});
  }

  async findAll(idList?: string) {
    let idArray: string[] = [];
    if(idList) {
      idArray = idList.split(',');
    }
    if(idArray.length > 0) {
      const response = await this.prisma.user.findMany({ where: {id: {in: idArray}}});
      return response;
    }
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    return this.prisma.user.findUnique({ where: { id }, include: {prefs: {select: {colorScheme: true}}}});
  }

  findByEmail(signinUserDto: SigninUserDto) {
    return this.prisma.user.findFirst({ where: {email : signinUserDto.email }, include: {prefs: {select: {colorScheme: true}}}});
  }

  async update(userId: string, updateUserDto: UpdateUserDto) {
    if(updateUserDto.password){
      const user = await this.findOne(userId);
      if(user && updateUserDto.oldPassword){
        const match = await bcrypt.compare(updateUserDto.oldPassword, user.password);
        if(match){
          updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        } else {
          throw new Error(errorConstant.passwordNotMatching);
        }
      }
    }
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: updateUserDto,
    });
    return updated;
  }

  remove(reqUserId, id: string) {
    //control user rights
    if(reqUserId !== id) {
      throw new BadRequestException(errorConstant.noUserRightsOnUser);
    }
    return this.prisma.user.delete({ where: { id } });
  }

  findAllUsersByServerId(serverId: string){
    return this.prisma.user.findMany({where: { servers : { some : { serverId }}}, orderBy: { pseudo : 'asc'}});
  }

  async searchUser(name: string){
    const users = await this.prisma.user.findMany({ where : { pseudo : {contains: name.toLowerCase()}}, orderBy : { pseudo : 'asc'}});
    return users;
  }

  async updatePrefs(userId: string, prefs: PrefsDto) {
    const oldPrefs = await this.prisma.userPrefs.findUnique({where: {userId}});
    if(oldPrefs == null) {
      return await this.prisma.userPrefs.create({data: {userId, ...prefs}});
    }
    return await this.prisma.userPrefs.update({where: {id: oldPrefs.id}, data: prefs});
  }
}
