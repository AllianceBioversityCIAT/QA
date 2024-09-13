import 'dotenv/config';
import { NestFactory } from '@nestjs/core';
import { Logger } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';
import { env } from 'process';

async function bootstrap() {
  const logger: Logger = new Logger('Bootstrap');
  const app = await NestFactory.create(AppModule, {
    cors: true,
  });
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  const port = env.PORT || 3000;
  const swaggerConfig = new DocumentBuilder()
    .setTitle('CGIAR QA API')
    .setDescription('Quality Assesment API for CGIAR')
    .setVersion('2.0')
    .addSecurity('Authorization', {
      type: 'apiKey',
      'x-tokenName': 'auth',
      name: 'auth',
      in: 'header',
      description: 'JWT Token',
    })
    .addSecurityRequirements('Authorization')
    .build();

  const swaggerDocument = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('swagger', app, swaggerDocument);

  await app
    .listen(port)
    .then(() => {
      logger.debug(`Server is running on http://localhost:${port}`);
      logger.debug(`Swagger is running on http://localhost:${port}/swagger`);
    })
    .catch((error) => {
      const portValue: number | string = port || '<Not defined>';
      logger.error(`Application failed to start on port ${portValue}`);
      logger.error(`Error starting server ${error}`);
    });
}
bootstrap();
