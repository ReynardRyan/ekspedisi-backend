import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { Permission } from '@prisma/client';

@Injectable()
export class PermissionsService {
  constructor(private prisma: PrismaService) { }

  async findAll(): Promise<Permission[]> {
    return await this.prisma.permission.findMany();
  }

  async findOne(id: number): Promise<Permission> {
    const permission = await this.prisma.permission.findUnique({
      where: {
        id: +id,
      },
    });
    if (!permission) {
      throw new NotFoundException('Permission not found');
    }
    return permission;
  }

  async getUserPermission(userId: number): Promise<String[]> {
    const user = await this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      return [];
    }
    return user.role.rolePermissions.map((rolePermission) => rolePermission.permission.key) || [];
  }

  async userHasAnyPermission(userId: number, permission: string): Promise<boolean> {
    const userPermissions = await this.getUserPermission(userId);
    return userPermissions.includes(permission);
  }

  async userHasAllPermissions(userId: number, permission: string[]): Promise<boolean> {
    const userPermissions = await this.getUserPermission(userId);
    return permission.every((permission) => userPermissions.includes(permission));
  }
}
