import { Module } from '@nestjs/common';
import { BancrollSettingsService } from './bancroll-settings.service';
import { BancrollSettingsController } from './bancroll-settings.controller';

@Module({
  controllers: [BancrollSettingsController],
  providers: [BancrollSettingsService]
})
export class BancrollSettingsModule {}
