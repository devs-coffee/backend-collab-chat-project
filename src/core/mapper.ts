import { CreateUserDto } from "../users/dto/create-user.dto";
import { UserEntity } from "../users/entities/user.entity";

export class Mapper {
    public userEntityToDto(user: UserEntity) : CreateUserDto {
        const mappedUser = new CreateUserDto();
        mappedUser.email = user.email;
        mappedUser.picture = user.picture;
        mappedUser.pseudo = user.pseudo;

        return mappedUser;
    }
}