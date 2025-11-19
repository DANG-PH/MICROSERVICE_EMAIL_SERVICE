import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { EmailController } from './email.controller';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MailerModule.forRoot({
        transport: {
            host: 'smtp.gmail.com',
            port: 465,
            secure: true,
            auth: {
            user: process.env.MAIL_USER,
            pass: process.env.MAIL_PASS,
            },
        },
        defaults: {
            from: `"HDG Studio" <${process.env.MAIL_USER}>`,
        },
    }),
     // Đăng ký RabbitMQ client để inject vào EmailController
    ClientsModule.register([
      {
        name: 'MAIL_SERVICE',
        transport: Transport.RMQ,
        options: {
          urls: ['amqp://guest:guest@localhost:5672'], 
          queue: 'email_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [],
  controllers: [EmailController],
})
export class EmailModule {}