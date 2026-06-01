import { Module } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { ShipmentsController } from './shipments.controller';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueueModule } from 'src/common/queue/queue.module';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { xenditService } from 'src/common/xendit/xendit.service';
import { ShipmentsWebhookController } from './webhook/shipments-webhook.controller';
import { QrCodeService } from 'src/common/qrcode/qrcode.service';

@Module({
  imports: [QueueModule],
  controllers: [ShipmentsController, ShipmentsWebhookController],
  providers: [ShipmentsService, PrismaService, OpencageService, xenditService, QrCodeService],
})
export class ShipmentsModule { }
