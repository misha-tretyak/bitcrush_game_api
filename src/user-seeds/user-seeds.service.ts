import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserSeedDto } from './dto/create-user-seed.dto';
import { UpdateUserSeedDto } from './dto/update-user-seed.dto';
import { UserSeed } from './user-seeds.model';

@Injectable()
export class UserSeedsService {
    constructor(@InjectModel(UserSeed) private readonly userSeedRepository: typeof UserSeed) { }

    create(createUserSeedDto: CreateUserSeedDto) {
        return this.userSeedRepository.create(createUserSeedDto);
    }

    findAll() {
        return this.userSeedRepository.findAll();
    }

    findOne(user_id: string) {
        return this.userSeedRepository.findOne({ where: { user_id, is_active: true }, attributes: { exclude: ['server_seed_private'] } });
    }

    update(id: string, updateUserSeedDto: UpdateUserSeedDto) {
        return this.userSeedRepository.update(updateUserSeedDto, { where: { id } });
    }

    remove(id: string) {
        return this.userSeedRepository.destroy({ where: { id } });
    }
}
