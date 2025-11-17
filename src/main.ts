import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Logger } from '@nestjs/common';

async function bootstrap() {
  const logger = new Logger('Bootstrap');

  const app = await NestFactory.create(AppModule);

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3001',
    credentials: true,
  });

  const port = process.env.PORT || 3000;
  await app.listen(port);

  logger.log(`🚀 PolkaMesh Backend Service running on port ${port}`);
  logger.log(`📡 Connected to: ${process.env.RPC_URL}`);
  logger.log(`⚡ Environment: ${process.env.NODE_ENV || 'development'}`);
}

bootstrap();
