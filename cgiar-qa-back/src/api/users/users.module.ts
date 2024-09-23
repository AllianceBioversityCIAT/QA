import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserRepository } from './users.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { AuthModule } from '../auth/auth.module';
import { JwtService } from '@nestjs/jwt';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';

@Module({
  controllers: [UsersController],
  providers: [
    UsersService,
    CrpRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    UserRepository,
    RoleRepository,
    JwtService,
    BcryptPasswordEncoder
  ],
  exports: [UsersService, UserRepository],
  imports: [AuthModule],
})
export class UsersModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'users/*', method: RequestMethod.ALL });
  }
}
