import { Injectable } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import * as QRCode from 'qrcode';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class QrCodeService {
    private readonly uploadsPath = 'public/uploads/qrcodes';
    constructor() {
        if (!fs.existsSync(this.uploadsPath)) {
            fs.mkdirSync(this.uploadsPath, { recursive: true });
        }
    }

    async generateQrCode(trackingNumber: string): Promise<string> {
        try {
            const QrCode = await import('qrcode');
            const fileName = `${trackingNumber}_${Date.now()}.png`;
            const filePath = path.join(this.uploadsPath, fileName);

            await QrCode.toFile(filePath, trackingNumber);
            return `uploads/qrcodes/${fileName}`;
        } catch (error) {
            throw new Error('Failed to generate QR code')
        }
    }




}