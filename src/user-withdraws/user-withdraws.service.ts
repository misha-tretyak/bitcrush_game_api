import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserWithdrawDto } from './dto/create-user-withdraw.dto';
import { UpdateUserWithdrawDto } from './dto/update-user-withdraw.dto';
import { UserWithdraw } from './user-withdraws.model';

const STATUS_PENDING = 0;
const STATUS_ACCEPTED = 1;
const STATUS_FINISHED = 2;
const STATUS_DECLINED = 3;

@Injectable()
export class UserWithdrawsService {
    constructor(@InjectModel(UserWithdraw) private readonly userWithdrawRepository: typeof UserWithdraw) { }

    create(createUserWithdrawDto: CreateUserWithdrawDto) {
        return this.userWithdrawRepository.create(createUserWithdrawDto);
    }

    findAll() {
        return this.userWithdrawRepository.findAll();
    }

    findOne(id: string) {
        return this.userWithdrawRepository.findOne({ where: { id } });
    }

    update(id: string, updateUserWithdrawDto: UpdateUserWithdrawDto) {
        return this.userWithdrawRepository.update(updateUserWithdrawDto, { where: { id } });
    }

    remove(id: string) {
        return this.userWithdrawRepository.destroy({ where: { id } });
    }

    findByUserIdAndStatusAndDate(id: string, date: Date) {
        return this.userWithdrawRepository.findAll({ where: { user_id: id, status: { in: [STATUS_FINISHED, STATUS_ACCEPTED] }, createdAt: { gt: date } } });
    }
}
