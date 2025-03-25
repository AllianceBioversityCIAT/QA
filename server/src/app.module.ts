import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import {
  APP_FILTER,
  APP_GUARD,
  APP_INTERCEPTOR,
  RouterModule,
} from "@nestjs/core";
import { MainRoutes } from "./main.routes";
import { TypeOrmModule } from "@nestjs/typeorm";
import { datasource } from "./config/orm.config";
import { AuthModule } from "./api/auth/auth.module";
import { CommentsModule } from "./api/comments/comments.module";
import { EvaluationsModule } from "./api/evaluations/evaluations.module";
import { IndicatorsModule } from "./api/indicators/indicators.module";
import { UsersModule } from "./api/users/users.module";
import { GlobalExceptions } from "./shared/error/global.exception";
import { LoggingInterceptor } from "./shared/interceptor/loggin.interceptor";
import { JwtService } from "@nestjs/jwt";
import { JwtMiddleware } from "./shared/middlewares/jwt.middleware";
import { RolesModule } from "./api/roles/roles.module";
import { ResponseInterceptor } from "./shared/interceptor/response.interceptor";
import { AiHelperModule } from "./api/ai-helper/ai-helper.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 100,
      },
    ]),
    AuthModule,
    UsersModule,
    IndicatorsModule,
    EvaluationsModule,
    CommentsModule,
    AiHelperModule,
    RouterModule.register(MainRoutes),
    TypeOrmModule.forRoot({
      ...datasource.options,
      keepConnectionAlive: true,
      autoLoadEntities: true,
    }),
    RolesModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ResponseInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptions,
    },
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    JwtService,
    JwtMiddleware,
  ],
})
export class AppModule {}
