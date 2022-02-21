import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateUserDepositDto } from './dto/create-user-deposit.dto';
import { UpdateUserDepositDto } from './dto/update-user-deposit.dto';
import { UserDeposit } from './user-deposits.model';


const STATUS_PENDING = 0;
const STATUS_ACCEPTED = 1;
const STATUS_FINISHED = 2;
const STATUS_DECLINED = 3;

@Injectable()
export class UserDepositsService {
    constructor(@InjectModel(UserDeposit) private readonly userDepositRepository: typeof UserDeposit) { }

    create(createUserDepositDto: CreateUserDepositDto) {
        return this.userDepositRepository.create(createUserDepositDto);
    }

    findAll() {
        return this.userDepositRepository.findAll();
    }

    findOne(id: string) {
        return this.userDepositRepository.findOne({ where: { id } });
    }

    update(id: string, updateUserDepositDto: UpdateUserDepositDto) {
        return this.userDepositRepository.update(updateUserDepositDto, { where: { id } });
    }

    remove(id: string) {
        return this.userDepositRepository.destroy({ where: { id } });
    }

    findByUserIdAndStatusAndDate(id: string, date: Date) {
        return this.userDepositRepository.findAll({ where: { user_id: id, status: { in: [STATUS_ACCEPTED, STATUS_FINISHED] }, updatedAt: { gt: date } } });
    }


}
