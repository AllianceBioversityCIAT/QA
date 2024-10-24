import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponse, ApiTags } from '@nestjs/swagger';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiTags('Welcompe API')
  @ApiResponse({
    status: 200,
    description: 'Welcome to the QA API',
  })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
