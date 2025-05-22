import { NestFactory } from '@nestjs/core';
import { VersioningType } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { urlencoded, json } from 'express';

import { setupGracefulShutdown } from 'nestjs-graceful-shutdown';
import * as compression from 'compression';
import helmet from 'helmet';
import { readFileSync } from 'fs';

import { AppModule } from './modules/app/module.module';
import { RedisIoAdapter } from './adapter';

async function bootstrap() {
  let httpsOptions = undefined;
  // if (process.env.NODE_ENV === 'development') {
  //   httpsOptions = {
  //     key: readFileSync('./secrets/api-key.pem'),
  //     cert: readFileSync('./secrets/api.pem'),
  //   };
  // }

  const app = await NestFactory.create(AppModule, { httpsOptions });

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ limit: '50mb' }));

  setupGracefulShutdown({ app });

  if (process.env.DEFAULT_SERVICE_VERSION) {
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: process.env.DEFAULT_SERVICE_VERSION,
    });
  }

  if (process.env.CORS_ENABLED === 'true') {
    app.enableCors({
      origin: process.env.CORS_ORIGIN,
      methods: process.env.CORS_METHODS,
      credentials: process.env.CORS_CREDENTIALS === 'true',
    });
  }

  app.use(compression());
  app.use(helmet());

  const configService = app.get<ConfigService>(ConfigService);
  const PORT =
    configService.get<number>('PORT', {
      infer: true,
    }) ||
    configService.get<number>('SERVER_PORT', {
      infer: true,
    });

  await app.listen(PORT);
}
bootstrap();
