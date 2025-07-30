import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { AuthMicroserviceService } from './auth-microservice.service';

@Module({
  imports: [HttpModule],
  providers: [AuthMicroserviceService],
  exports: [AuthMicroserviceService],
})
export class AuthMicroserviceModule {}
