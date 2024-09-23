import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserRepository } from '../users/users.repository';
import { GeneralConfigurationRepository } from '../../shared/repositories/general-config.repository';
import { CycleRepository } from '../../shared/repositories/cycle.repository';
import { BcryptPasswordEncoder } from '../../utils/bcrypt.utils';
import { TokenAuthRepository } from './repositories/token-auth.repository';
import { CrpRepository } from '../../shared/repositories/crp.repository';
import { RoleRepository } from '../roles/repositories/role.repository';
import { JwtMiddleware } from '../../shared/middlewares/jwt.middleware';
import { JwtModule, JwtService } from '@nestjs/jwt';
import constConfig from '../../config/const.config';
import { PermissionRepository } from './repositories/permission.repository';

@Module({
  controllers: [AuthController],
  providers: [
    AuthService,
    UserRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    TokenAuthRepository,
    CrpRepository,
    BcryptPasswordEncoder,
    RoleRepository,
    PermissionRepository,
    JwtService,
  ],
  exports: [AuthService, RoleRepository, PermissionRepository],
  imports: [
    JwtModule.register({
      secret: constConfig.jwtSecret,
      signOptions: { expiresIn: constConfig.jwtTime },
    }),
  ],
})
export class AuthModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes(
        { path: 'auth/change-password', method: RequestMethod.POST },
        { path: 'auth/create-config', method: RequestMethod.POST },
      );
  }
}
