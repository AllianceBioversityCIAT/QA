import { Routes } from '@nestjs/core';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { CommentsModule } from './comments/comments.module';
import { EvaluationsModule } from './evaluations/evaluations.module';
import { IndicatorsModule } from './indicators/indicators.module';
import { RolesModule } from './roles/roles.module';

export const ModulesRoutes: Routes = [
  {
    path: 'auth',
    module: AuthModule,
  },
  {
    path: 'user',
    module: UsersModule,
  },
  {
    path: 'indicator',
    module: IndicatorsModule,
  },
  {
    path: 'comment',
    module: CommentsModule,
  },
  {
    path: 'evaluation',
    module: EvaluationsModule,
  },
  {
    path: 'role',
    module: RolesModule,
  },
];
