import { Controller, Post, Body, HttpCode, HttpStatus } from "@nestjs/common";
import { ShipmentsService } from "../shipments.service";
import { XenditWebhookDto } from "../dto/xendit-webhook.dto";

@Controller('shipments/webhook')
export class ShipmentsWebhookController {
    constructor(
        private readonly shipments: ShipmentsService
    ) { }

    @Post('xendit')
    @HttpCode(HttpStatus.OK)
    async handleXenditWebhook(@Body() webHookData: XenditWebhookDto): Promise<{ message: string }> {
        await this.shipments.handlePaymentWebhook(webHookData);
        return { message: 'Webhook received successfully' };
    }
}