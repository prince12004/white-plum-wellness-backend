import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreatePackageDto } from './dto/create-package.dto';
import { ListPackagesQueryDto } from './dto/list-packages-query.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { PackagesService } from './packages.service';

@Controller('packages')
export class PackagesController {
  constructor(
    private readonly packagesService: PackagesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListPackagesQueryDto) {
    return this.packagesService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.packagesService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('packages:create')
  async create(@Body() dto: CreatePackageDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.packagesService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'packages',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('packages:update')
  async update(@Param('id') id: string, @Body() dto: UpdatePackageDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.packagesService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'packages',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('packages:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.packagesService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'packages',
      entityId: id,
      req,
    });
    return result;
  }
}
