import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService)  {}

  create(createUserDto: CreateUserDto) {
    //return 'This action adds a new user';
    return this.prisma.user.create({ data: createUserDto});
  }

  findAll() {
    //return `This action returns all users`;
    return this.prisma.user.findMany();
  }

  findOne(id: string) {
    //return `This action returns a #${id} user`;
    return this.prisma.user.findUnique({ where: { id } });
  }

  update(id: string, updateUserDto: UpdateUserDto) {
    //return `This action updates a #${id} user`;
    return this.prisma.user.update({
      where: { id },
      data: updateUserDto,
    });
  }

  remove(id: string) {
    //return `This action removes a #${id} user`;
    return this.prisma.user.delete({ where: { id } });
  }
}
