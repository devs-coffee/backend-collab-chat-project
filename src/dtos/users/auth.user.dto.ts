import { AutoMap } from "@automapper/classes";
import { UserDto } from "./user.dto";

export class AuthUserDto extends UserDto {
    @AutoMap()
    refreshToken: string;
}