import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CategoriesService } from './categories.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Controller('categories')
export class CategoriesController {
  constructor(
    private readonly categoriesService: CategoriesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListCategoriesQueryDto) {
    return this.categoriesService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.categoriesService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('categories:create')
  async create(@Body() dto: CreateCategoryDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.categoriesService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'categories',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('categories:update')
  async update(@Param('id') id: string, @Body() dto: UpdateCategoryDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.categoriesService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'categories',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('categories:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.categoriesService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'categories',
      entityId: id,
      req,
    });
    return result;
  }
}
