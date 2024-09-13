import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { APP_FILTER, APP_INTERCEPTOR, RouterModule } from '@nestjs/core';
import { MainRoutes } from './main.routes';
import { TypeOrmModule } from '@nestjs/typeorm';
import { datasource } from './config/orm.config';
import { AuthModule } from './api/auth/auth.module';
import { CommentsModule } from './api/comments/comments.module';
import { EvaluationsModule } from './api/evaluations/evaluations.module';
import { IndicatorsModule } from './api/indicators/indicators.module';
import { UsersModule } from './api/users/users.module';
import { GlobalExceptions } from './shared/error/global.exception';
import { LoggingInterceptor } from './shared/interceptor/loggin.interceptor';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from './shared/middlewares/jwt.middleware';
import { RolesModule } from './api/roles/roles.module';

@Module({
  imports: [
    AuthModule,
    UsersModule,
    IndicatorsModule,
    EvaluationsModule,
    CommentsModule,
    RouterModule.register(MainRoutes),
    TypeOrmModule.forRoot({
      ...datasource.options,
      keepConnectionAlive: true,
      autoLoadEntities: true,
    }),
    RolesModule
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
    {
      provide: APP_FILTER,
      useClass: GlobalExceptions,
    },
    JwtService,
    JwtMiddleware,
  ],
})
export class AppModule {}
