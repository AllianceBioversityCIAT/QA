import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { EvaluationsService } from './evaluations.service';
import { EvaluationsController } from './evaluations.controller';
import { EvaluationRepository } from './repositories/evaluation.repository';
import { UserRepository } from '../users/users.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { AuthService } from '../auth/auth.service';
import { TokenAuthRepository } from '../auth/repositories/token-auth.repository';
import { CommentsRepository } from '../comments/repositories/comments.repository';
import { TagsRepository } from '../comments/repositories/tags.repository';
import { ReplyTypeRepository } from '../comments/repositories/reply-type.repository';
import { CommentsRepliesRepository } from '../comments/repositories/comments-reply.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';
import { BatchesRepository } from '../../shared/repositories/batch.repository';

@Module({
  controllers: [EvaluationsController],
  providers: [
    EvaluationsService,
    EvaluationRepository,
    UserRepository,
    CrpRepository,
    RoleRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    CommentsRepository,
    TagsRepository,
    ReplyTypeRepository,
    CommentsRepliesRepository,
    IndicatorsRepository,
    BatchesRepository,
    JwtService,
    AuthService,
    BcryptPasswordEncoder,
    TokenAuthRepository,
  ],
})
export class EvaluationsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'evaluations', method: RequestMethod.ALL });
  }
}
