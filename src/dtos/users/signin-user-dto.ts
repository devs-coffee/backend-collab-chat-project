import { PickType } from "@nestjs/swagger";
import { CreateUserDto } from "./create-user.dto";

export class SigninUserDto extends PickType(CreateUserDto, ['email', 'password'] as const) {}