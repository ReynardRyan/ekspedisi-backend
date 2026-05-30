import { Injectable } from '@nestjs/common';
import { CreateUserAddressDto } from './dto/create-user-address.dto';
import { UpdateUserAddressDto } from './dto/update-user-address.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { OpencageService } from 'src/common/opencage/opencage.service';
import { UserAddress } from '@prisma/client';

@Injectable()
export class UserAddressesService {

  constructor(
    private prisma: PrismaService,
    private openCage: OpencageService,
  ) { }

  private readonly UPLOADS_PATH = './public/uploads/photos/';

  private generatePhotoPath(filename?: string): string | null {
    return filename ? `${this.UPLOADS_PATH}${filename}` : null;
  }

  private async getCoordinatesFromAddress(address: string): Promise<{ lat: number; lng: number }> {
    return await this.openCage.geocode(address);
  }

  async create(createUserAddressDto: CreateUserAddressDto, userId: number, photoFilename?: string | null): Promise<UserAddress> {
    try {
      const { lat, lng } = await this.getCoordinatesFromAddress(createUserAddressDto.address);
      if (photoFilename) {
        createUserAddressDto.photo = this.generatePhotoPath(photoFilename)
      }

      return this.prisma.userAddress.create({
        data: {
          userId,
          address: createUserAddressDto.address,
          tag: createUserAddressDto.tag,
          label: createUserAddressDto.label,
          photo: createUserAddressDto.photo,
          latitude: lat,
          longitude: lng,
        }
      })
    } catch (error) {
      throw error;
    }

  }

  async findAll(userId: number): Promise<UserAddress[]> {
    return this.prisma.userAddress.findMany({
      where: { userId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          }
        }
      }
    })
  }

  async findOne(id: number): Promise<UserAddress> {
    const data = await this.prisma.userAddress.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          }
        }
      }
    })

    if (!data) {
      throw new Error('Alamat tidak ditemukan');
    }

    return data;
  }

  async update(id: number, updateUserAddressDto: UpdateUserAddressDto, photoFilename?: string | null): Promise<UserAddress> {
    const userAddress = await this.findOne(id);

    if (!userAddress) {
      throw new Error('Alamat tidak ditemukan');
    }

    let newLatitude: number = userAddress.latitude!;
    let newLongitude: number = userAddress.longitude!;

    if (updateUserAddressDto.address && updateUserAddressDto.address !== userAddress.address) {
      const { lat, lng } = await this.getCoordinatesFromAddress(updateUserAddressDto.address);
      newLatitude = lat;
      newLongitude = lng;
    }

    if (photoFilename) {
      updateUserAddressDto.photo = this.generatePhotoPath(photoFilename)
    }

    return this.prisma.userAddress.update({
      where: { id },
      data: {
        address: updateUserAddressDto.address ?? userAddress.address,
        tag: updateUserAddressDto.tag ?? userAddress.tag,
        label: updateUserAddressDto.label ?? userAddress.label,
        photo: updateUserAddressDto.photo ?? userAddress.photo,
        latitude: newLatitude,
        longitude: newLongitude,
      }
    })
  }

  async remove(id: number): Promise<UserAddress> {
    const userAddress = await this.findOne(id);

    if (!userAddress) {
      throw new Error('Alamat tidak ditemukan');
    }

    return this.prisma.userAddress.delete({
      where: { id },
    })
  }
}
