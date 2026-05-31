import { Processor, Process } from "@nestjs/bull";
import { Injectable, Logger } from "@nestjs/common";
import { Job } from "bull";
import { PaymentStatus } from "src/common/enum/payment-status.enum";
import { PrismaService } from "src/common/prisma/prisma.service";
import { xenditService } from "src/common/xendit/xendit.service";

export interface PaymentExpiryJobData {
    paymentId: number;
    shipmentId: number;
    externalId: string;
}

@Processor('payment-expired-queue')
@Injectable()
export class PaymentExpiryQueueProcessor {
    private readonly logger = new Logger(PaymentExpiryQueueProcessor.name);
    constructor(
        private readonly prisma: PrismaService,
        private readonly xendit: xenditService,
    ) { }

    @Process('expire-payment')
    async handleExpirePayment(job: Job<PaymentExpiryJobData>) {
        const { paymentId, shipmentId, externalId } = job.data;
        try {
            const payment = await this.prisma.payment.findUnique({
                where: { id: paymentId },
                include: {
                    shipment: {
                        include: {
                            shipmentDetail: {
                                include: {
                                    user: {
                                        select: {
                                            email: true,
                                            name: true
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            });

            if (!payment) {
                this.logger.warn(`Payment ${paymentId} not found`);
                return;
            }

            if (payment && payment.status === PaymentStatus.PENDING) {
                this.logger.log(`Processing payment expiry for shipment ID ${shipmentId} and payment ID ${paymentId}`);
                return;
            };

            await this.prisma.$transaction(async (prisma) => {
                await prisma.payment.update({
                    where: { id: paymentId },
                    data: {
                        status: PaymentStatus.EXPIRED,
                    },
                });
                await prisma.shipment.update({
                    where: { id: shipmentId },
                    data: {
                        paymentStatus: PaymentStatus.EXPIRED,
                    }
                })
                await prisma.shipmentHistory.create({
                    data: {
                        shipmentId,
                        status: PaymentStatus.EXPIRED,
                        description: `Payment expired for shipment ID ${shipmentId} and payment ID ${paymentId}`,
                    },
                });
            })

            this.logger.log(`Payment ${paymentId} has been expired successfully`)
        } catch (error) {
            this.logger.error(`Failed to process payment expiry for shipment ID ${shipmentId}:`, error.stack);
            throw error;
        }
    }
}