import { Processor, Process } from "@nestjs/bull";
import { Logger } from "@nestjs/common";
import { Job } from "bull";
import { EmailService } from "src/common/email/email.service";

export interface EmailJobData {
    type: string;
    to: string;
    subject: string;
    html: string;
}

@Processor('email-queue')
export class EmailQueueProcessor {
    private readonly logger = new Logger(EmailQueueProcessor.name);

    constructor(
        private readonly emailService: EmailService
    ) { }

    @Process('send-email')
    async handleSendEmail(job: Job<EmailJobData>) {
        const { type, to, subject, html } = job.data;

        try {
            switch (type) {
                case 'send-email':
                    await this.emailService.sendMail(to, subject, html);
                    break;
                default:
                    break;
            }
        } catch (error) {
            this.logger.error(`Failed to send email to ${to}:`, error.stack);
            throw error;
        }
    }


}