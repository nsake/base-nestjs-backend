import helmet from 'helmet';
import {
  FastifyAdapter,
  NestFastifyApplication,
} from '@nestjs/platform-fastify';

import { NestFactory } from '@nestjs/core';
import { ValidationPipe, VersioningType } from '@nestjs/common';

import multipart from '@fastify/multipart';
import fastifyCsrf from '@fastify/csrf-protection';

import { AppModule } from './app.module';
import { RedisIoAdapter } from './adapters/adapters/RedisIoAdapter';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  app.enableCors({
    allowedHeaders: '*',
    origin: '*',
    credentials: true,
  });

  app.enableVersioning({
    type: VersioningType.URI,
  });

  app.use(helmet());

  await app.register(multipart);
  await app.register(fastifyCsrf);

  const redisIoAdapter = new RedisIoAdapter(app);
  await redisIoAdapter.connectToRedis();

  app.useWebSocketAdapter(redisIoAdapter);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
