import { AutoMap } from "@automapper/classes";
import { IsOptional, Matches  } from 'class-validator';
import { Match } from "../../core/match.decorator";

export class UpdateUserDto implements IUser {
    oldPassword?: string;

    @AutoMap()
    pseudo?: string;

    @AutoMap()
    picture?: string;

    @IsOptional()
    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Mot de passe trop faible'})
    @AutoMap()
    password?: string;

    @IsOptional()
    @Match('password')
    passwordConfirm?: string;
}
