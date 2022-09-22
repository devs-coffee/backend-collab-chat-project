import { ApiProperty } from '@nestjs/swagger';
import { AutoMap } from '@automapper/classes';
import { IsEmail, IsNotEmpty, Matches, MaxLength, MinLength } from 'class-validator';
import  { Match } from '../../core/match.decorator';

export class CreateUserDto implements IUser {
    @MinLength(4)
    @MaxLength(20)
    @AutoMap()
    @ApiProperty()
    pseudo: string;

    @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {message: 'Mot de passe trop faible'})
    @IsNotEmpty()
    @AutoMap()
    @ApiProperty()
    password: string;

    @Match('password')
    @IsNotEmpty()
    @ApiProperty()
    passwordConfirm: string;

    @IsEmail()
    @AutoMap()
    @ApiProperty()
    email: string;

    @AutoMap()
    @ApiProperty()
    picture?: string;
}
