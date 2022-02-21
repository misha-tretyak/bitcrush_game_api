import { PartialType } from '@nestjs/swagger';
import { CreateBancrollSettingDto } from './create-bancroll-setting.dto';

export class UpdateBancrollSettingDto extends PartialType(CreateBancrollSettingDto) {}
