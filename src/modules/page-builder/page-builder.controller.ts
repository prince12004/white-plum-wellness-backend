import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { PageBuilderService } from './page-builder.service';
import { CreateCustomPageDto } from './dto/create-custom-page.dto';
import { ListCustomPagesQueryDto } from './dto/list-custom-pages-query.dto';
import { UpdateCustomPageDto } from './dto/update-custom-page.dto';

@Controller('custom-pages')
export class PageBuilderController {
  constructor(
    private readonly pageBuilderService: PageBuilderService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListCustomPagesQueryDto) {
    return this.pageBuilderService.findAllPublic(query);
  }

  @Get('admin')
  @RequirePermissions('page-builder:read')
  findAllAdmin(@Query() query: ListCustomPagesQueryDto) {
    return this.pageBuilderService.findAllAdmin(query);
  }

  @Get('admin/:id')
  @RequirePermissions('page-builder:read')
  findOneAdmin(@Param('id') id: string) {
    return this.pageBuilderService.findById(id);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.pageBuilderService.findBySlugPublic(slug);
  }

  @Post()
  @RequirePermissions('page-builder:create')
  async create(@Body() dto: CreateCustomPageDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.pageBuilderService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'page-builder',
      entityId: String(created._id),
      entityLabel: created.title,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('page-builder:update')
  async update(@Param('id') id: string, @Body() dto: UpdateCustomPageDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.pageBuilderService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'page-builder',
      entityId: id,
      entityLabel: updated.title,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('page-builder:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.pageBuilderService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'page-builder',
      entityId: id,
      req,
    });
    return result;
  }
}
