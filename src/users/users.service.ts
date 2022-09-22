import { Injectable } from '@nestjs/common';
import { SigninUserDto } from '../dtos/users/signin-user-dto';
import { UserDto } from '../dtos/users/user.dto';
import { UpdateUserDto } from '../dtos/users/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from 'src/dtos/users/create-user.dto';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService)  {}

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

  update(id: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    return this.prisma.user.delete({ where: { id } });
  }
}
