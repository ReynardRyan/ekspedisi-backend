import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ShipmentsService } from './shipments.service';
import { CreateShipmentDto } from './dto/create-shipment.dto';
import { UpdateShipmentDto } from './dto/update-shipment.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { RequiredPermissions } from '../auth/decorators/permission.decorator';
import { Shipment } from '.prisma/client';
import { BaseResponse } from 'src/common/interface/base-response.interface';

@Controller('shipments')
@UseGuards(JwtAuthGuard)
export class ShipmentsController {
  constructor(private readonly shipmentsService: ShipmentsService) { }

  @Post()
  @RequiredPermissions('shipments.create')
  async create(@Body() createShipmentDto: CreateShipmentDto): Promise<BaseResponse<Shipment>> {
    const shipment = await this.shipmentsService.create(createShipmentDto);
    return {
      message: 'Shipment created successfully',
      data: shipment,
    }
  }

  @Get()
  findAll() {
    return this.shipmentsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.shipmentsService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateShipmentDto: UpdateShipmentDto) {
    return this.shipmentsService.update(+id, updateShipmentDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.shipmentsService.remove(+id);
  }
}
