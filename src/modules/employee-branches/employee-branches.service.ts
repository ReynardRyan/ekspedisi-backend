import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { PrismaService } from 'src/common/prisma/prisma.service';
import { EmployeeBranch } from '@prisma/client';
import { NotFoundError } from 'rxjs';
import * as bcrypt from 'bcrypt';

@Injectable()
export class EmployeeBranchesService {
  constructor(private prisma: PrismaService) { }

  private async validateUniqueEmail(email: string, excludeUserId?: number) {
    const existingEmployee = await this.prisma.user.findUnique({
      where: { email },
    });
    if (existingEmployee && existingEmployee.id !== excludeUserId) {
      throw new BadRequestException('Email already exists');
    }
  }

  private async validateBranchExist(branchId: number) {
    const existingBranch = await this.prisma.branch.findUnique({
      where: { id: branchId },
    });
    if (!existingBranch) {
      throw new NotFoundException('Branch does not exist');
    }
  }

  private async validateRoleExist(roleId: number) {
    const existingRole = await this.prisma.role.findUnique({
      where: { id: roleId },
    });
    if (!existingRole) {
      throw new NotFoundException('Role does not exist');
    }
  }

  async create(createEmployeeBranchDto: CreateEmployeeBranchDto): Promise<EmployeeBranch> {
    await Promise.all([
      this.validateUniqueEmail(createEmployeeBranchDto.email),
      this.validateBranchExist(createEmployeeBranchDto.branch_id),
      this.validateRoleExist(createEmployeeBranchDto.role_id),
    ]);

    return this.prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          name: createEmployeeBranchDto.name,
          email: createEmployeeBranchDto.email,
          phoneNumber: createEmployeeBranchDto.phone_number,
          password: await bcrypt.hash(createEmployeeBranchDto.password, 10),
          avatar: createEmployeeBranchDto.avatar,
          roleId: createEmployeeBranchDto.role_id,
        },
      });

      const employeeBranch = await tx.employeeBranch.create({
        data: {
          userId: user.id,
          branchId: createEmployeeBranchDto.branch_id,
          type: createEmployeeBranchDto.type,
        },
      });

      return employeeBranch;
    });
  }

  async findAll(): Promise<EmployeeBranch[]> {
    return this.prisma.employeeBranch.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });
  }

  async findOne(id: number): Promise<EmployeeBranch> {
    const employeeBranch = await this.prisma.employeeBranch.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true,
            avatar: true,
          },
        },
        branch: {
          select: {
            id: true,
            name: true,
            address: true,
          },
        },
      },
    });

    if (!employeeBranch) {
      throw new NotFoundException('Employee branch not found');
    }

    return employeeBranch;
  }

  async update(id: number, updateEmployeeBranchDto: UpdateEmployeeBranchDto): Promise<EmployeeBranch> {
    const existingEmployeeBranch = await this.findOne(id);
    const validationPromises: Promise<void>[] = [];

    if (updateEmployeeBranchDto.email) {
      validationPromises.push(this.validateUniqueEmail(updateEmployeeBranchDto.email, existingEmployeeBranch.userId));
    }

    if (updateEmployeeBranchDto.branch_id) {
      validationPromises.push(this.validateBranchExist(updateEmployeeBranchDto.branch_id));
    }

    if (updateEmployeeBranchDto.role_id) {
      validationPromises.push(this.validateRoleExist(updateEmployeeBranchDto.role_id));
    }

    return this.prisma.$transaction(async (tx) => {
      await Promise.all(validationPromises);

      const updatedUser = await tx.user.update({
        where: { id: existingEmployeeBranch.userId },
        data: {
          name: updateEmployeeBranchDto.name,
          email: updateEmployeeBranchDto.email,
          phoneNumber: updateEmployeeBranchDto.phone_number,
          avatar: updateEmployeeBranchDto.avatar,
          roleId: updateEmployeeBranchDto.role_id,
          ...(updateEmployeeBranchDto.password && {
            password: await bcrypt.hash(updateEmployeeBranchDto.password, 10),
          }),
        },
      });

      const updatedEmployeeBranch = await tx.employeeBranch.update({
        where: { id },
        data: {
          branchId: updateEmployeeBranchDto.branch_id,
          type: updateEmployeeBranchDto.type,
        },
      });

      return {
        ...updatedEmployeeBranch,
      };
    });
  }

  async remove(id: number): Promise<void> {
    const employeeBranch = await this.findOne(id);
    return this.prisma.$transaction(async (tx) => {
      await tx.employeeBranch.delete({
        where: { id },
      });

      await tx.user.delete({
        where: { id: employeeBranch.userId },
      });
    });
  }
}
