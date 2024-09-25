import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { CommentsService } from './comments.service';
import { CommentsController } from './comments.controller';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { CommentsRepository } from './repositories/comments.repository';
import { UserRepository } from '../users/users.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { JwtService } from '@nestjs/jwt';
import { AuthModule } from '../auth/auth.module';
import { AuthService } from '../auth/auth.service';
import { TokenAuthRepository } from '../auth/repositories/token-auth.repository';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { CommentsRepliesRepository } from './repositories/comments-reply.repository';
import { ReplyTypeRepository } from './repositories/reply-type.repository';
import { TagsRepository } from './repositories/tags.repository';
import { TagTypeRepository } from './repositories/tags-type.repository';
import { IndicatorsRepository } from '../indicators/repositories/indicators.repository';
import { CommentsMetaRepository } from './repositories/comments-meta.repository';
import { BatchesRepository } from '../../shared/repositories/batch.repository';
import { EvaluationRepository } from '../evaluations/repositories/evaluation.repository';
import { QuickCommentsRepository } from './repositories/quick-comments.repository';

@Module({
  controllers: [CommentsController],
  providers: [
    CommentsService,
    CommentsRepository,
    CommentsRepliesRepository,
    ReplyTypeRepository,
    TagsRepository,
    TagTypeRepository,
    CommentsMetaRepository,
    IndicatorsRepository,
    BatchesRepository,
    EvaluationRepository,
    QuickCommentsRepository,
    UserRepository,
    CrpRepository,
    RoleRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    JwtService,
    AuthService,
    BcryptPasswordEncoder,
    TokenAuthRepository,
  ],
  imports: [AuthModule],
})
export class CommentsModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'indicators', method: RequestMethod.ALL });
  }
}
