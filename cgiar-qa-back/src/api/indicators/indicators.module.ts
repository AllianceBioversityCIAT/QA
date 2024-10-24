import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { IndicatorsService } from './indicators.service';
import { IndicatorsController } from './indicators.controller';
import { IndicatorsRepository } from './repositories/indicators.repository';
import { UserRepository } from '../users/users.repository';
import { IndicatorUsersRepository } from './repositories/indicators-users.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { BatchesRepository } from '../../shared/repositories/batch.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { TokenAuthRepository } from '../auth/repositories/token-auth.repository';

@Module({
  controllers: [IndicatorsController],
  providers: [
    IndicatorsService,
    IndicatorsRepository,
    UserRepository,
    IndicatorUsersRepository,
    EvaluationRepository,
    CrpRepository,
    BatchesRepository,
    RoleRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    JwtService,
    AuthService,
    BcryptPasswordEncoder,
    TokenAuthRepository,
  ],
  imports: [AuthModule],
  exports: [IndicatorsService, IndicatorsRepository],
})
export class IndicatorsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'indicators', method: RequestMethod.ALL });
  }
}
