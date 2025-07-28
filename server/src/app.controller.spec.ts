import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {
    it('should return HTML with QA API info', () => {
      const result = appController.getHello();
      expect(result).toContain('QA API');
      expect(result).toContain('Quality Assessment API for CGIAR');
      expect(result).toContain('Version: 2.0');
    });
  });
});
