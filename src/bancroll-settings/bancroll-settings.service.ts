import { Injectable } from '@nestjs/common';
import { CreateBancrollSettingDto } from './dto/create-bancroll-setting.dto';
import { UpdateBancrollSettingDto } from './dto/update-bancroll-setting.dto';

@Injectable()
export class BancrollSettingsService {
  create(createBancrollSettingDto: CreateBancrollSettingDto) {
    return 'This action adds a new bancrollSetting';
  }

  findAll() {
    return `This action returns all bancrollSettings`;
  }

  findOne(id: number) {
    return `This action returns a #${id} bancrollSetting`;
  }

  update(id: number, updateBancrollSettingDto: UpdateBancrollSettingDto) {
    return `This action updates a #${id} bancrollSetting`;
  }

  remove(id: number) {
    return `This action removes a #${id} bancrollSetting`;
  }
}
