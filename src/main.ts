import dotenv from 'dotenv'
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Smtp } from './smtp/smtp';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.get(Smtp).start(25);
}
bootstrap();
