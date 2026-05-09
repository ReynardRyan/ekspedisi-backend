import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UseInterceptors, UploadedFile } from '@nestjs/common';
import { ProfileService } from './profile.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ProfileResponse } from './response/profile.response';
import { BaseResponse } from 'src/common/interface/base-response.interface';
import { JwtAuthGuard } from '../auth/guards/logged-in.guard';
import { FileFieldsInterceptor, FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';

@Controller('profile')
@UseGuards(JwtAuthGuard)
export class ProfileController {
  constructor(private readonly profileService: ProfileService) { }

  @Get()
  async findOne(@Req() req: Request & { user?: any }): Promise<BaseResponse<ProfileResponse>> {
    return {
      message: 'Success',
      data: await this.profileService.findOne(req.user.id)
    }
  }

  @Patch()
  @UseInterceptors(
    FileInterceptor('avatar', {
      storage: diskStorage({
        destination: './public/uploads/photos',
        filename: (req, file, cb) => {
          const randomName = Array(32).fill(null).map(() => Math.round(Math.random() * 16).toString(16)).join('');
          cb(null, `${randomName}${file.originalname}`);
        }
      }),
      fileFilter: (req, file, cb) => {
        if (!file.originalname.match(/\.(jpg|jpeg|png|gif)$/)) {
          return cb(new Error('Invalid file type'), false);
        }
        cb(null, true);
      }
    })
  )
  async update(
    @Req() req: Request & { user?: any },
    @Body() updateProfileDto: UpdateProfileDto,
    @UploadedFile() avatar: Express.Multer.File | undefined
  ): Promise<BaseResponse<ProfileResponse>> {
    return {
      message: 'Profile updated successfully',
      data: await this.profileService.update(req.user.id, updateProfileDto, avatar ? avatar?.filename : null)
    }
  }
}
