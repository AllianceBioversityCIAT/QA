import { Module } from '@nestjs/common';
import { AiHelperService } from './ai-helper.service';
import { AiHelperController } from './ai-helper.controller';
import { AiHelperRepository } from './ai-helper.repository';

@Module({
  controllers: [AiHelperController],
  providers: [AiHelperService, AiHelperRepository],
})
export class AiHelperModule {}
