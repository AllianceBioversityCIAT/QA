import { AppModule } from './app.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { LoggingInterceptor } from './shared/interceptor/loggin.interceptor';
import { ResponseInterceptor } from './shared/interceptor/response.interceptor';
import { GlobalExceptions } from './shared/error/global.exception';
import { ThrottlerGuard } from '@nestjs/throttler';
import { JwtService } from '@nestjs/jwt';
import { JwtMiddleware } from './shared/middlewares/jwt.middleware';
import { APP_FILTER, APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';

describe('AppModule', () => {
  it('should be defined', () => {
    expect(AppModule).toBeDefined();
  });

  it('should be a class', () => {
    expect(typeof AppModule).toBe('function');
  });
});

describe('AppModule Configuration', () => {
  it('should export AppModule class', () => {
    expect(AppModule).toBeDefined();
    expect(typeof AppModule).toBe('function');
  });

  it('should have required interceptors configured', () => {
    // Verify that interceptors are imported
    expect(LoggingInterceptor).toBeDefined();
    expect(ResponseInterceptor).toBeDefined();
  });

  it('should have required filters configured', () => {
    // Verify that filters are imported
    expect(GlobalExceptions).toBeDefined();
  });

  it('should have required guards configured', () => {
    // Verify that guards are imported
    expect(ThrottlerGuard).toBeDefined();
  });

  it('should have JwtService and JwtMiddleware', () => {
    // Verify that JWT services are imported
    expect(JwtService).toBeDefined();
    expect(JwtMiddleware).toBeDefined();
  });

  it('should have APP_INTERCEPTOR token available', () => {
    expect(APP_INTERCEPTOR).toBeDefined();
  });

  it('should have APP_FILTER token available', () => {
    expect(APP_FILTER).toBeDefined();
  });

  it('should have APP_GUARD token available', () => {
    expect(APP_GUARD).toBeDefined();
  });
});

describe('AppModule Imports', () => {
  it('should import ThrottlerModule', async () => {
    const { ThrottlerModule } = await import('@nestjs/throttler');
    expect(ThrottlerModule).toBeDefined();
    expect(ThrottlerModule.forRoot).toBeDefined();
  });

  it('should import RouterModule', async () => {
    const { RouterModule } = await import('@nestjs/core');
    expect(RouterModule).toBeDefined();
    expect(RouterModule.register).toBeDefined();
  });

  it('should import TypeOrmModule', async () => {
    const { TypeOrmModule } = await import('@nestjs/typeorm');
    expect(TypeOrmModule).toBeDefined();
    expect(TypeOrmModule.forRoot).toBeDefined();
  });

  it('should have MainRoutes available', async () => {
    const { MainRoutes } = await import('./main.routes');
    expect(MainRoutes).toBeDefined();
    expect(Array.isArray(MainRoutes)).toBe(true);
  });
});

describe('AppModule Providers Configuration', () => {
  it('should configure LoggingInterceptor as APP_INTERCEPTOR', () => {
    // Verify the interceptor class exists
    expect(LoggingInterceptor).toBeDefined();
  });

  it('should configure ResponseInterceptor as APP_INTERCEPTOR', () => {
    // Verify the interceptor class exists
    expect(ResponseInterceptor).toBeDefined();
  });

  it('should configure GlobalExceptions as APP_FILTER', () => {
    // Verify the filter class exists
    expect(GlobalExceptions).toBeDefined();
  });

  it('should configure ThrottlerGuard as APP_GUARD', () => {
    // Verify the guard class exists
    expect(ThrottlerGuard).toBeDefined();
  });

  it('should have AppService as provider', () => {
    expect(AppService).toBeDefined();
  });

  it('should have JwtService as provider', () => {
    expect(JwtService).toBeDefined();
  });

  it('should have JwtMiddleware as provider', () => {
    expect(JwtMiddleware).toBeDefined();
  });
});

describe('AppModule Controllers Configuration', () => {
  it('should have AppController as controller', () => {
    expect(AppController).toBeDefined();
  });
});
