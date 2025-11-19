import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls: ['amqp://guest:guest@localhost:5672'], 
      queue: 'email_queue',
      queueOptions: { durable: true }, // queue sẽ tồn tại sau khi restart RabbitMQ
    },
  });

  await app.listen();
  console.log('✅ EmailService đang lắng nghe RabbitMQ...');
}
bootstrap();