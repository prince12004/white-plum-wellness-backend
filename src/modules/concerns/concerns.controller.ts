import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ConcernsService } from './concerns.service';
import { CreateConcernDto } from './dto/create-concern.dto';
import { ListConcernsQueryDto } from './dto/list-concerns-query.dto';
import { UpdateConcernDto } from './dto/update-concern.dto';

@Controller('concerns')
export class ConcernsController {
  constructor(
    private readonly concernsService: ConcernsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListConcernsQueryDto) {
    return this.concernsService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.concernsService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('concerns:create')
  async create(@Body() dto: CreateConcernDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.concernsService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'concerns',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('concerns:update')
  async update(@Param('id') id: string, @Body() dto: UpdateConcernDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.concernsService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'concerns',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('concerns:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.concernsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'concerns',
      entityId: id,
      req,
    });
    return result;
  }
}
