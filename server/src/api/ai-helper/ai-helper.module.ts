import {
  MiddlewareConsumer,
  Module,
  NestModule,
  RequestMethod,
} from "@nestjs/common";
import { AiHelperService } from "./ai-helper.service";
import { AiHelperController } from "./ai-helper.controller";
import { AiHelperRepository } from "./ai-helper.repository";
import { JwtMiddleware } from "../../shared/middlewares/jwt.middleware";
import { JwtService } from "@nestjs/jwt";
import { BcryptPasswordEncoder } from "../../utils/bcrypt.utils";
import { AuthService } from "../auth/auth.service";
import { TokenAuthRepository } from "../auth/repositories/token-auth.repository";
import { UserRepository } from "../users/users.repository";
import { GeneralConfigurationRepository } from "../../shared/repositories/general-config.repository";
import { CycleRepository } from "../../shared/repositories/cycle.repository";
import { CrpRepository } from "../../shared/repositories/crp.repository";
import { RoleRepository } from "../roles/repositories/role.repository";
import { UserRoleRepository } from "../users/user-role.repository";

@Module({
  controllers: [AiHelperController],
  providers: [
    AiHelperService,
    AiHelperRepository,
    JwtService,
    AuthService,
    BcryptPasswordEncoder,
    TokenAuthRepository,
    UserRepository,
    GeneralConfigurationRepository,
    CycleRepository,
    CrpRepository,
    UserRoleRepository,
    RoleRepository,
  ],
  imports: [],
})
export class AiHelperModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(JwtMiddleware)
      .forRoutes({ path: "api/ai-helper", method: RequestMethod.ALL });
  }
}
