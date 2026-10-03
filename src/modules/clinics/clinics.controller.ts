import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ClinicsService } from './clinics.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { ListClinicsQueryDto } from './dto/list-clinics-query.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Controller('clinics')
export class ClinicsController {
  constructor(
    private readonly clinicsService: ClinicsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListClinicsQueryDto) {
    return this.clinicsService.findAll(query);
  }

  @Public()
  @Get('cities')
  getCities() {
    return this.clinicsService.getCities();
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.clinicsService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('clinics:create')
  async create(@Body() dto: CreateClinicDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.clinicsService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'clinics',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('clinics:update')
  async update(@Param('id') id: string, @Body() dto: UpdateClinicDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.clinicsService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'clinics',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('clinics:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.clinicsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'clinics',
      entityId: id,
      req,
    });
    return result;
  }
}
