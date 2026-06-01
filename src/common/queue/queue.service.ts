import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EmailJobData } from "./processors/email-queue.processor";
import { PaymentExpiryJobData } from "./processors/payment-expired-queue.processor";

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('email-queue') private emailQueue: Queue,
        @InjectQueue('payment-expired-queue') private paymentExpiryQueue: Queue,
    ) { }

    async addEmailJob(data: EmailJobData, options?: { delay?: number, attempts?: number }) {
        return await this.emailQueue.add('send-email', data, {
            delay: options?.delay,
            attempts: options?.attempts,
            removeOnComplete: true,
            removeOnFail: true,
            backoff: {
                type: 'exponential',
                delay: options?.delay || 1000,
            },
        });
    }

    async addPaymentExpiryJob(data: PaymentExpiryJobData, expiryDate: Date) {
        const delay = expiryDate.getTime() - Date.now();

        if (delay <= 0) {
            return this.paymentExpiryQueue.add('expire-payment', data, {
                attempts: 3,
                removeOnComplete: 10,
                removeOnFail: 5,
                backoff: {
                    type: 'exponential',
                    delay: 2000,
                },
            });
        }

        return await this.paymentExpiryQueue.add('expire-payment', data, {
            delay,
            attempts: 3,
            removeOnComplete: 10,
            removeOnFail: 5,
            backoff: {
                type: 'exponential',
                delay: 2000,
            },
        });
    }

    async cancelPaymentExpiryJob(paymentId: number) {
        const jobs = await this.paymentExpiryQueue.getJobs(['delayed', 'waiting']);

        for (const job of jobs) {
            if (job.data.paymentId === paymentId) {
                await job.remove();
                break;
            }
        }
    }
}