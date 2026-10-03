import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { ServicesService } from './services.service';

@Controller('services')
export class ServicesController {
  constructor(
    private readonly servicesService: ServicesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListServicesQueryDto) {
    return this.servicesService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.servicesService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  async findRelated(@Param('slug') slug: string) {
    const service = await this.servicesService.findBySlug(slug);
    return this.servicesService.findRelated(service);
  }

  @Post()
  @RequirePermissions('services:create')
  async create(@Body() dto: CreateServiceDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.servicesService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'services',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('services:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateServiceDto,
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ) {
    const updated = await this.servicesService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'services',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('services:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.servicesService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'services',
      entityId: id,
      req,
    });
    return result;
  }
}
