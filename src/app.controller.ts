import { Controller, Get, UseGuards } from '@nestjs/common';
import { AppService } from './app.service';
import { JwtAuthGuard } from './modules/auth/guards/logged-in.guard';
import { EmailService } from './common/email/email.service';
import { QueueService } from './common/queue/queue.service';

@Controller()
// @UseGuards(JwtAuthGuard)
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly emailService: EmailService,
    private readonly queueService: QueueService
  ) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('send-email')
  async sendEmailTest() {
    // await this.emailService.sendMail('reynardryan21@gmail.com', 'Test Email Cuy', 'This is a test email');
    await this.queueService.addEmailJob({
      type: 'send-email',
      to: 'reynardryan21@gmail.com',
      subject: 'Test Email Cuy',
      html: 'This is a test email'
    });
    return { message: 'Email sent successfully' };
  }
}
