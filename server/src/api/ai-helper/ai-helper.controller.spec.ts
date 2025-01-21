import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperController } from './ai-helper.controller';
import { AiHelperService } from './ai-helper.service';

describe('AiHelperController', () => {
  let controller: AiHelperController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AiHelperController],
      providers: [AiHelperService],
    }).compile();

    controller = module.get<AiHelperController>(AiHelperController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
