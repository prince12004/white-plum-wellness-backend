import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { ListMediaAssetsQueryDto } from './dto/list-media-assets-query.dto';
import { UpdateMediaAssetDto } from './dto/update-media-asset.dto';
import { MediaService } from './media.service';

const MAX_FILE_SIZE_BYTES = 8 * 1024 * 1024; // 8MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/avif'];

@Controller('media')
export class MediaController {
  constructor(private readonly mediaService: MediaService) {}

  @Post('upload')
  @RequirePermissions('media:create')
  @UseInterceptors(FileInterceptor('file', { limits: { fileSize: MAX_FILE_SIZE_BYTES } }))
  async upload(@UploadedFile() file: Express.Multer.File | undefined, @CurrentUser() user: RequestUser) {
    if (!file) throw new BadRequestException('No file uploaded');
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException('Only JPEG, PNG, WebP, or AVIF images are allowed');
    }
    return this.mediaService.uploadImage(file, file.originalname, user.userId);
  }

  @Get('assets')
  @RequirePermissions('media:read')
  findAll(@Query() query: ListMediaAssetsQueryDto) {
    return this.mediaService.findAll(query);
  }

  @Patch('assets/:id')
  @RequirePermissions('media:update')
  update(@Param('id') id: string, @Body() dto: UpdateMediaAssetDto) {
    return this.mediaService.update(id, dto);
  }

  @Delete('assets/:id')
  @RequirePermissions('media:delete')
  async remove(@Param('id') id: string) {
    await this.mediaService.remove(id);
    return { success: true };
  }

  /** One-time migration helper: pulls a remote (e.g. Unsplash) image into Cloudinary. */
  @Post('migrate-url')
  @RequirePermissions('media:create')
  async migrateFromUrl(@Body() body: { url: string; name: string; category?: string }) {
    const asset = await this.mediaService.uploadFromUrl(body.url, body.name, body.category ?? null);
    return { url: asset.url, assetId: String(asset._id) };
  }
}
