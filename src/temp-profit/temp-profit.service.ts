import { Injectable } from "@nestjs/common";
import { CreateTempProfitDto } from "./dto/create-temp-profit.dto";
import { InjectModel } from "@nestjs/sequelize";
import { TempProfit } from "./temp-profit.model";
import { UpdateTempProfitDto } from "./dto/update-temp-profit.dto";

@Injectable()
export class TempProfitService {
  constructor(
    @InjectModel(TempProfit)
    private readonly tempProfitRepository: typeof TempProfit
  ) {}
  create(createTempProfitDto: CreateTempProfitDto) {
    return this.tempProfitRepository.create(createTempProfitDto);
  }

  findAll() {
    return this.tempProfitRepository.findAll();
  }

  findOneByWallet(wallet: string) {
    return this.tempProfitRepository.findOne({ where: { wallet } });
  }

  update(wallet: string, updateTempProfitDto: UpdateTempProfitDto) {
    return this.tempProfitRepository.update(updateTempProfitDto, {
      where: { wallet },
    });
  }

  remove(wallet: string) {
    return this.tempProfitRepository.destroy({ where: { wallet } });
  }
}
