import { CreateUserDto } from "../dtos/users/create-user.dto";
import { User } from "@prisma/client";

export class Mapper {
    public userEntityToDto(user: User | User[], withPassword = false) : CreateUserDto | CreateUserDto[] {
        if(Array.isArray(user)){
            const usersModel : CreateUserDto[] = [];
            user.map(u => {
                const mappedUser = new CreateUserDto();
                mappedUser.id = u.id;
                mappedUser.email = u.email;
                mappedUser.picture = u.picture;
                mappedUser.pseudo = u.pseudo;
                usersModel.push(mappedUser);
            });
            return usersModel;
        } else {
            const mappedUser = new CreateUserDto();
            withPassword ? mappedUser.password = user.password : null;
            mappedUser.id = user.id;
            mappedUser.email = user.email;
            mappedUser.picture = user.picture;
            mappedUser.pseudo = user.pseudo;
            return mappedUser;
        }
    }
}