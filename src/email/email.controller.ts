import { Controller, Inject } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { MailerService } from '@nestjs-modules/mailer';
import { ClientProxy } from '@nestjs/microservices';
import { ItemService } from 'src/item/item.service';
import { AddItemRequest, Item } from 'proto/item.pb';

function sleep(ms: number) {
  return new Promise((True, False) => setTimeout(True, ms));
}

@Controller()
export class EmailController {
  constructor(
    private readonly mailerService: MailerService,
    private readonly itemService: ItemService,
    @Inject(String(process.env.RABBIT_SERVICE)) private readonly client: ClientProxy
  ) {}  
  @EventPattern('send_email')
  async handleSendEmail(@Payload() data: { to: string; subject: string; html: string }) {
    console.log('Nhận email:', data.to);
    let attempts = 0;
    const maxAttempts = 2;
    while (attempts < maxAttempts) {
      try {
        await this.mailerService.sendMail(data);
        console.log('✅ Email gửi thành công:', data.to);
        break;
      } catch (err) {
        attempts++;
        if (attempts >= maxAttempts) {
          // console.error('Email gửi thất bại', err);
          console.log('❌ Email gửi thất bại:', data.to);
          break;
        }
        console.log(`⚠️ Lỗi gửi email ${data.to}, thử lại lần ${attempts} sau 5s`);
        await sleep(5000);; // delay 5s
      }
    }
    //Delay này giúp không spam SMTP server liên tục và tăng cơ hội gửi thành công nếu lỗi tạm thời.
  }
  @EventPattern('send_emails')
  async handleSendEmailBulk(
    @Payload() data: { emails: string[]; subject: string; html: string; }
  ) {
    for (const email of data.emails) {
      this.client.emit('send_email', {to: email, subject: data.subject, html: data.html });
    }
  }
  
  @EventPattern('save_item')
  async handleSaveItem(
    @Payload() data: { data: AddItemRequest }
  ) {
    const MAX_RETRIES = 3;
    const RETRY_DELAY = 1000;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        await this.itemService.handleAddItem(data.data);
        return;
      } catch (error) {
        if (attempt === MAX_RETRIES) {
          throw error;
        }
        console.log(`⚠️ Lỗi save item, thử lại lần ${attempt} sau ${RETRY_DELAY * attempt}ms`);
        await sleep(RETRY_DELAY * attempt); // dùng sleep có sẵn
      }
    }
  }
}

// Sau khi producer publish message vào queue, các consumer sẽ subscribe để nhận từng message và xử lý.
// Email service không lắng nghe HTTP port (vì là microservice RMQ), nên có thể khởi chạy nhiều instance song song.
// Mỗi terminal chạy email service được xem là một consumer riêng lẻ lắng nghe cùng queue 'email_queue'.
// Điều này giúp tăng tốc độ xử lý hàng đợi (parallel processing), giảm tải cho server.

// Tại sao dùng RabbitMQ để gửi email thay vì await trực tiếp?

// 1, Không làm chậm API chính (producer gửi message vào queue rồi trả về luôn)
// 2, Có thể retry khi SMTP lỗi (consumer tự retry hoặc dùng DLX queue)
// 3, Log được trạng thái qua queue (message nào còn trong queue => vẫn chưa xử lý)
// 4, Dễ scale ngang: chỉ cần chạy thêm nhiều consumer để xử lý song song
// 5, Không bị nghẽn event loop nếu gửi hàng nghìn email cùng lúc

// => RabbitMQ đóng vai trò như "Background Job + Load Balancer" cho service gửi email ( dùng round robin )