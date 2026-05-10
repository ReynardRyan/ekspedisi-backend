import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { EmployeeBranchesService } from './employee-branches.service';
import { CreateEmployeeBranchDto } from './dto/create-employee-branch.dto';
import { UpdateEmployeeBranchDto } from './dto/update-employee-branch.dto';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from 'src/modules/auth/guards/logged-in.guard';
import { RequiredPermissions } from 'src/modules/auth/decorators/permission.decorator';
import { PermissionGuard } from 'src/modules/auth/guards/permission.guard';
import { EmployeeBranch } from '@prisma/client';
import { BaseResponse } from 'src/common/interface/base-response.interface';
import { string } from 'zod';


@Controller('employee-branches')
@UseGuards(JwtAuthGuard, PermissionGuard)
export class EmployeeBranchesController {
  constructor(private readonly employeeBranchesService: EmployeeBranchesService) { }

  @Post()
  @RequiredPermissions('employee.create')
  async create(@Body() createEmployeeBranchDto: CreateEmployeeBranchDto): Promise<BaseResponse<EmployeeBranch>> {
    return {
      message: 'Employee branch created successfully',
      data: await this.employeeBranchesService.create(createEmployeeBranchDto),
    }
  }

  @Get()
  @RequiredPermissions('employee.read')
  async findAll(): Promise<BaseResponse<EmployeeBranch[]>> {
    return {
      message: 'Employee branches fetched successfully',
      data: await this.employeeBranchesService.findAll(),
    }
  }


  @Get(':id')
  @RequiredPermissions('employee.read')
  async findOne(@Param('id') id: string): Promise<BaseResponse<EmployeeBranch>> {
    return {
      message: 'Employee branch fetched successfully',
      data: await this.employeeBranchesService.findOne(+id),
    }
  }

  @Patch(':id')
  @RequiredPermissions('employee.update')
  async update(@Param('id') id: string, @Body() updateEmployeeBranchDto: UpdateEmployeeBranchDto): Promise<BaseResponse<EmployeeBranch>> {
    return {
      message: 'Employee branch updated successfully',
      data: await this.employeeBranchesService.update(+id, updateEmployeeBranchDto),
    }
  }

  @Delete(':id')
  @RequiredPermissions('employee.delete')
  async remove(@Param('id') id: string): Promise<BaseResponse<void>> {
    await this.employeeBranchesService.remove(+id);
    return {
      message: 'Employee branch deleted successfully',
      data: null,
    }
  }
}
