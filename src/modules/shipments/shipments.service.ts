import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { QueueService } from 'src/common/queue/queue.service';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { xenditService } from 'src/common/xendit/xendit.service';
import { Shipment } from '@prisma/client';
import { getDistance } from 'geolib';
import { PaymentStatus } from 'src/common/enum/payment-status.enum';
import { XenditWebhookDto } from './dto/xendit-webhook.dto';
import { QrCodeService } from 'src/common/qrcode/qrcode.service';
import { ShipmentStatus } from 'src/common/enum/shipment-status.enum';

@Injectable()
export class ShipmentsService {

  constructor(
    private prisma: PrismaService,
    private queue: QueueService,
    private openCage: OpencageService,
    private xendit: xenditService,
    private qrcode: QrCodeService
  ) { }

  async create(createShipmentDto: CreateShipmentDto): Promise<Shipment> {
    const { lat, lng } = await this.openCage.geocode(
      createShipmentDto.destination_address,
    );

    const userAddress = await this.prisma.userAddress.findFirst({
      where: {
        id: createShipmentDto.pickup_address_id,
      },
      include: {
        user: true,
      }
    })

    if (!userAddress || !userAddress.latitude || !userAddress.longitude) {
      throw new NotFoundException("Pickup address not found or incomplete");
    }

    const distance = getDistance(
      {
        latitude: userAddress.latitude,
        longitude: userAddress.longitude,
      },
      {
        latitude: lat,
        longitude: lng
      }
    )

    const distanceInKm = distance / 1000;

    const shipmentCost = this.calculateShipmentCost(
      distanceInKm,
      createShipmentDto.weight,
      createShipmentDto.delivery_type
    )

    const shipment = await this.prisma.$transaction(async (prisma) => {
      const newShipment = await prisma.shipment.create({
        data: {
          paymentStatus: PaymentStatus.PENDING,
          distance: distanceInKm,
          price: shipmentCost.totalPrice
        }
      })

      await prisma.shipmentDetail.create({
        data: {
          shipmentId: newShipment.id,
          pickupAddressId: createShipmentDto.pickup_address_id,
          destinationAddress: createShipmentDto.destination_address,
          recipientName: createShipmentDto.recipient_name,
          recipientPhone: createShipmentDto.recipient_phone,
          weight: createShipmentDto.weight,
          packageType: createShipmentDto.package_type,
          deliveryType: createShipmentDto.delivery_type,
          destinationLatitude: lat,
          destinationLongitude: lng,
          basePrice: shipmentCost.basePrice,
          weightPrice: shipmentCost.weightPrice,
          distancePrice: shipmentCost.distancePrice,
          userId: userAddress.id
        }
      })

      return newShipment;

    })

    const invoice = await this.xendit.createInvoice({
      externalId: `INV-${Date.now()}-${shipment.id}`,
      amount: shipmentCost.totalPrice,
      payerEmail: userAddress.user.email,
      description: `Shipment ID: ${shipment.id}`,
      successRedirectUrl: `${process.env.FRONTEND_URL}/${shipment.id}/payment-success`,
      invoiceDuration: 86400
    })

    const payment = await this.prisma.$transaction(async (prisma) => {
      const createdPayment = await prisma.payment.create({
        data: {
          shipmentId: shipment.id,
          externalId: invoice.externalId,
          invoiceId: invoice.id,
          status: invoice.status,
          invoiceUrl: invoice.invoiceUrl,
          expiryDate: invoice.expiryDate,
        }
      })

      await prisma.shipmentHistory.create({
        data: {
          shipmentId: shipment.id,
          status: PaymentStatus.PENDING,
          description: `Shipment created with total price ${shipmentCost.totalPrice}`
        }
      })

      return createdPayment;
    })

    try {
      await this.queue.addEmailJob({
        type: 'payment-notification',
        to: userAddress.user.email,
        shipmentId: shipment.id,
        amount: shipmentCost.totalPrice,
        paymentUrl: invoice.invoiceUrl,
        expiryDate: invoice.expiryDate,
      })
    } catch (error) {
      console.log(error);
    }

    try {
      await this.queue.addPaymentExpiryJob({
        paymentId: payment.id,
        shipmentId: shipment.id,
        externalId: invoice.externalId,
      },
        invoice.expiryDate)
    } catch (error) {
      console.log(error);
    }

    return shipment;
  }

  async handlePaymentWebhook(webHookData: XenditWebhookDto): Promise<void> {
    const payment = await this.prisma.payment.findFirst({
      where: {
        externalId: webHookData.external_id,
      },
      include: {
        shipment: {
          include: {
            shipmentDetail: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!payment) {
      throw new NotFoundException("Payment not found");
    }

    await this.prisma.$transaction(async (prisma) => {
      const updatedPayment = await prisma.payment.update({
        where: {
          id: payment.id
        },
        data: {
          status: webHookData.status,
          paymentMethod: webHookData.payment_method,
        }
      })

      if (webHookData.status === 'PAID' || webHookData.status === 'SETTLED') {
        const trackingNumber = `KA${webHookData.id}`;

        let qrcodeImagePath: string | null = null;
        try {
          qrcodeImagePath = await this.qrcode.generateQrCode(trackingNumber);
        } catch (error) {
          throw new BadRequestException("Failed to generate QR code");
        }

        await prisma.shipment.update({
          where: {
            id: payment.shipmentId
          },
          data: {
            trackingNumber,
            deliveryStatus: ShipmentStatus.READY_TO_PICKUP,
            paymentStatus: webHookData.status,
            qrCodeImage: qrcodeImagePath,
          }
        });

        await prisma.shipmentHistory.create({
          data: {
            shipmentId: payment.shipmentId,
            status: ShipmentStatus.READY_TO_PICKUP,
            description: `Shipment payment status updated to ${webHookData.status}`,
            userId: payment.shipment.shipmentDetail?.userId,
          }
        })

        try {
          await this.queue.cancelPaymentExpiryJob(payment.id)
        } catch (error) {
          throw new BadRequestException("Failed to cancel payment expiry job");
        }

        try {
          const userEmail = payment.shipment.shipmentDetail?.user.email;

          if (userEmail) {
            await this.queue.addEmailJob({
              type: 'payment-success',
              to: userEmail,
              shipmentId: payment.shipmentId,
              trackingNumber: payment.shipment.trackingNumber || undefined,
              amount: payment.shipment.price || webHookData.amount
            })
          }
        } catch (error) {

        }
      }
    })

  }

  findAll() {
    return `This action returns all shipments`;
  }

  findOne(id: number) {
    return `This action returns a #${id} shipment`;
  }

  update(id: number, updateShipmentDto: UpdateShipmentDto) {
    return `This action updates a #${id} shipment`;
  }

  remove(id: number) {
    return `This action removes a #${id} shipment`;
  }

  private calculateShipmentCost(distance: number, weight: number, deliveryType: string): {
    totalPrice: number;
    basePrice: number;
    weightPrice: number;
    distancePrice: number;
  } {
    const baseRates = {
      same_day: 15000,
      next_day: 10000,
      regular: 5000,
    }
    const weightRates = {
      same_day: 1000,
      next_day: 800,
      regular: 500
    }

    const distanceTierRates = {
      same_day: {
        tier1: 8000,
        tier2: 12000,
        tier3: 15000
      },
      next_day: {
        tier1: 6000,
        tier2: 9000,
        tier3: 12000
      },
      regular: {
        tier1: 4000,
        tier2: 6000,
        tier3: 8000
      }
    }

    const basePrice = baseRates[deliveryType] || baseRates.regular;
    const weightRate = weightRates[deliveryType] || weightRates.regular;
    const distanceRate = distanceTierRates[deliveryType] || distanceTierRates.regular;

    const weightKg = Math.ceil(weight / 1000);
    const weightPrice = weightKg * weightRate;

    let distancePrice = 0;
    if (distance <= 50) {
      distancePrice = distanceRate.tier1;
    } else if (distance <= 100) {
      distancePrice = distanceRate.tier1 + distanceRate.tier2;
    } else {
      const extraDistance = Math.ceil((distance - 100) / 100) * 3000;
      distancePrice = distanceRate.tier3 + extraDistance * distanceRate.tier3;
    }

    const totalPrice = basePrice + weightPrice + distancePrice;
    const minimumPrice = 10000;
    const finalPrice = Math.max(totalPrice, minimumPrice);

    return {
      totalPrice,
      basePrice,
      weightPrice,
      distancePrice
    }

  }
}
