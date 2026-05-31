import { Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";
import { QueueService } from "./queue.service";
import { EmailQueueProcessor } from "./processors/email-queue.processor";
import { EmailService } from "src/common/email/email.service";
import { PaymentExpiryQueueProcessor } from "./processors/payment-expired-queue.processor";
import { PrismaService } from "../prisma/prisma.service";

@Module({
    imports: [
        BullModule.forRoot({
            redis: {
                host: process.env.REDIS_HOST,
                port: Number(process.env.REDIS_PORT),
                password: process.env.REDIS_PASSWORD || undefined,
            },
        }),
        BullModule.registerQueue({
            name: 'email-queue',
        }),
        BullModule.registerQueue({
            name: 'payment-expired-queue',
        })
    ],
    controllers: [],
    providers: [EmailService, EmailQueueProcessor, QueueService, PaymentExpiryQueueProcessor, PrismaService],
    exports: [QueueService]
})

export class QueueModule { }