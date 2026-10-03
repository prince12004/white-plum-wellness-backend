import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { ListGalleryQueryDto } from './dto/list-gallery-query.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GalleryService } from './gallery.service';

@Controller('gallery')
export class GalleryController {
  constructor(
    private readonly galleryService: GalleryService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListGalleryQueryDto) {
    return this.galleryService.findAll(query);
  }

  @Post()
  @RequirePermissions('gallery:create')
  async create(@Body() dto: CreateGalleryItemDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.galleryService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'gallery',
      entityId: String(created._id),
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('gallery:update')
  async update(@Param('id') id: string, @Body() dto: UpdateGalleryItemDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.galleryService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'gallery',
      entityId: id,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('gallery:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.galleryService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'gallery',
      entityId: id,
      req,
    });
    return result;
  }
}
