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
        name: String(process.env.RABBIT_SERVICE),
        transport: Transport.RMQ,
        options: {
          urls: [String(process.env.RABBIT_URL)], 
          queue: process.env.RABBIT_QUEUE,
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  providers: [],
  controllers: [EmailController],
})
export class EmailModule {}