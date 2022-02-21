import { Inject, Injectable, forwardRef, Logger } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { CreateUserBonusDto } from "./dto/create-user-bonus.dto";
import { UpdateUserBonusDto } from "./dto/update-user-bonus.dto";
import { UserBonus } from "./user-bonuses.model";
import sequelize, { FindOptions } from "sequelize";
import { User } from "src/users/users.model";
import { UsersService } from "../users/users.service";

const BALANCE_CHANGE_TYPE = "balance_change";
const BONUS_BALANCE_CHANGE_TYPE = "bonus_balance_change";

@Injectable()
export class UserBonusesService {
  constructor(
    @InjectModel(UserBonus)
    private readonly userBonusRepository: typeof UserBonus,
    @Inject(forwardRef(() => UsersService))
    private readonly usersService: UsersService
  ) {}

  private logger: Logger = new Logger("UserBonusesService");

  create(createUserBonusDto: CreateUserBonusDto) {
    return this.userBonusRepository.create(createUserBonusDto);
  }

  findAll() {
    return this.userBonusRepository.findAll();
  }

  findOne(id: string) {
    return this.userBonusRepository.findOne({ where: { id } });
  }

  update(id: string, updateUserBonusDto: UpdateUserBonusDto) {
    return this.userBonusRepository.update(updateUserBonusDto, {
      where: { id },
    });
  }

  remove(id: string) {
    return this.userBonusRepository.destroy({ where: { id } });
  }

  findByUserIdAndDate(id: string, date: Date) {
    return this.userBonusRepository.findAll({
      where: { user_id: id, createdAt: { gt: date } },
    });
  }

  public async getTotalBonusesAmount(
    fromDate: Date = null,
    toDate: Date = null,
    includeToDate: boolean = true
  ) {
    try {
      let build: FindOptions<UserBonus> = {};
      build.attributes = [
        [sequelize.fn("SUM", sequelize.col("amount")), "amount"],
      ];
      if (fromDate) {
        build.where = { createdAt: { gt: fromDate } };
      }

      if (toDate) {
        const dateToCondition = includeToDate
          ? { lte: toDate }
          : { lt: toDate };
        build.where = { createdAt: dateToCondition };
      }

      const amount = await this.userBonusRepository.findAll(build);

      return Number(amount[0].amount);
    } catch (err) {
      this.logger.debug(err, "Get Total Bonuses Amount Error");
    }
  }

  public addFixedBonus(user: User, type: string, bonus: number) {
    try {
      if (bonus) {
        const bonusAmount = bonus.toFixed(2);
        const newBonus = new UserBonus({
          user_id: user.id,
          type: type,
          amount: bonusAmount,
        });
        newBonus.save();
        this.usersService.giveToWallet(user.id, +bonusAmount);
      }
    } catch (err) {
      this.logger.debug(err, "Add Fixed Bonus Error");
    }
  }
}
