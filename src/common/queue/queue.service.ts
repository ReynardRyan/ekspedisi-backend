import { Injectable } from "@nestjs/common";
import { InjectQueue } from "@nestjs/bull";
import { Queue } from "bull";
import { EmailJobData } from "./processors/email-queue.processor";

@Injectable()
export class QueueService {
    constructor(
        @InjectQueue('email-queue') private emailQueue: Queue
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
}