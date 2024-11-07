import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { RoleRepository } from './repositories/role.repository';
import { PermissionRepository } from '../auth/repositories/permission.repository';
import { UsersModule } from '../users/users.module';
import { AuthModule } from '../auth/auth.module';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { JwtService } from '@nestjs/jwt';

@Module({
  controllers: [RolesController],
  providers: [RolesService, RoleRepository, PermissionRepository, JwtService],
  imports: [UsersModule, AuthModule],
})
export class RolesModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: 'roles', method: RequestMethod.ALL });
  }
}
