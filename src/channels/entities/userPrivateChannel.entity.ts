import { UserEntity } from '../../users/entities/user.entity';
import { UserChannelEntity } from './userChannel.entity';

export class UserPrivateChannelEntity extends UserChannelEntity {
    user?: UserEntity;
}