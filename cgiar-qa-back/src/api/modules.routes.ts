import { Routes } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { IndicatorsModule } from './indicators/indicators.module';

export const ModulesRoutes: Routes = [
  {
    path: 'auth',
    module: AuthModule,
  },
  {
    path: 'users',
    module: UsersModule,
  },
  {
    path: 'indicators',
    module: IndicatorsModule,
  },
  {
    path: 'comments',
    module: CommentsModule,
  },
  {
    path: 'evaluations',
    module: EvaluationsModule,
  },
];
