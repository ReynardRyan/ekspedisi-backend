import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UseInterceptors, Req, UploadedFile } from '@nestjs/common';
import { UserAddressesService } from './user-addresses.service';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { BaseResponse } from 'src/common/interface/base-response.interface';
import { UserAddress } from '@prisma/client';

@Controller('user-addresses')
@UseGuards(JwtAuthGuard)
export class UserAddressesController {
  constructor(private readonly userAddressesService: UserAddressesService) { }

  @Post()
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: './public/uploads/photos/',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          return cb(null, `${randomName}${file.originalname}`);
        }
      })
    })
  )

  @Post()
  async create(@Body() createUserAddressDto: CreateUserAddressDto, @Req() req: Request & { user?: any }, @UploadedFile() photo?: Express.Multer.File | undefined): Promise<BaseResponse<UserAddress>> {
    return {
      data: await this.userAddressesService.create(createUserAddressDto, req.user.id, photo?.filename),
      message: "Alamat berhasil ditambahkan",
    }
  }

  @Get()
  async findAll(@Req() req: Request & { user?: any }): Promise<BaseResponse<UserAddress[]>> {
    return {
      data: await this.userAddressesService.findAll(req.user.id),
      message: "Alamat berhasil diambil",
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BaseResponse<UserAddress>> {
    return {
      data: await this.userAddressesService.findOne(+id),
      message: "Alamat berhasil diambil",
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() updateUserAddressDto: UpdateUserAddressDto, @UploadedFile() photo?: Express.Multer.File | undefined): Promise<BaseResponse<UserAddress>> {
    return {
      data: await this.userAddressesService.update(+id, updateUserAddressDto, photo?.filename),
      message: "Alamat berhasil diupdate",
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<BaseResponse<void>> {
    try {
      await this.userAddressesService.remove(+id);
      return {
        data: null,
        message: "Alamat berhasil dihapus",
      }
    } catch (error) {
      throw error;
    }
  }
}
