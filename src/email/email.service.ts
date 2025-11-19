// import { Injectable, Logger } from '@nestjs/common';
// import { MailerService } from '@nestjs-modules/mailer';
// import { Ctx, EventPattern, Payload, RmqContext } from '@nestjs/microservices';

// @Injectable()
// export class EmailService {
//   constructor(private readonly mailerService: MailerService) {}

//   @EventPattern('send_email') // topic từ AuthService
//   async handleSendMail(@Payload() data: any, @Ctx() context: RmqContext) {
//     const channel = context.getChannelRef();
//     const message = context.getMessage();

//     await this.mailerService.sendMail({
//         to: data.to,
//         subject: data.subject,
//         html: data.html,
//     });
//     channel.ack(message);
//   }
// }