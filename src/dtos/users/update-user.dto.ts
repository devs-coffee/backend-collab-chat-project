import { AutoMap } from "@automapper/classes";
import { PartialType } from "@nestjs/swagger";
import { IsOptional, Matches  } from 'class-validator';
import { Match } from "../../core/match.decorator";
import { CreateUserDto } from "./create-user.dto";
import { UserDto } from "./user.dto";


export class UpdateUserDto extends PartialType(CreateUserDto) {
    oldPassword?: string;
    refreshToken?: string;
}

// export class UpdateUserDto implements IUser {
//     oldPassword?: string;

//     @AutoMap()
//     pseudo?: string;

//     @AutoMap()
//     picture?: string;

//     @IsOptional()
//     @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Mot de passe trop faible'})
//     @AutoMap()
//     password?: string;

//     @IsOptional()
//     @Match('password')
//     passwordConfirm?: string;
// }
