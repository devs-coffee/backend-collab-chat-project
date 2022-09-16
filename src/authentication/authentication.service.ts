import { Injectable } from '@nestjs/common';
import { CreateUserDto } from '../dtos/users/create-user.dto';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthenticationService {
  constructor(private prisma: PrismaService)  {}

  signup(createUserDto: CreateUserDto) {
    return this.prisma.user.create({ data: createUserDto});
  }

  signin(id: string) {
    return this.prisma.user.findUnique( {where: {id}});
  }
}
