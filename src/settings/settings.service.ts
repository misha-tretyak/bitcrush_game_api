import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { CreateSettingDto } from './dto/create-setting.dto';
import { UpdateSettingDto } from './dto/update-setting.dto';
import { Setting } from './settings.model';

@Injectable()
export class SettingsService {
  constructor(@InjectModel(Setting) private readonly settingRepository: typeof Setting) { }

  create(createSettingDto: CreateSettingDto) {
    return this.settingRepository.create(createSettingDto);
  }

  findAll() {
    return this.settingRepository.findAll();
  }

  findOne(id: string) {
    return this.settingRepository.findOne({ where: { id } });
  }

  update(id: string, updateSettingDto: UpdateSettingDto) {
    return this.settingRepository.update(updateSettingDto, { where: { id } });
  }

  remove(id: string) {
    return this.settingRepository.destroy({ where: { id } });
  }
}
