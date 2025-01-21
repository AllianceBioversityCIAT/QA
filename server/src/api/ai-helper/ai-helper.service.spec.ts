import { Test, TestingModule } from '@nestjs/testing';
import { AiHelperService } from './ai-helper.service';

describe('AiHelperService', () => {
  let service: AiHelperService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [AiHelperService],
    }).compile();

    service = module.get<AiHelperService>(AiHelperService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
