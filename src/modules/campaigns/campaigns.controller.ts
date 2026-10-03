import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignsQueryDto } from './dto/list-campaigns-query.dto';
import { UpdateCampaignDto } from './dto/update-campaign.dto';

@Controller('campaigns')
export class CampaignsController {
  constructor(
    private readonly campaignsService: CampaignsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequirePermissions('campaigns:read')
  findAll(@Query() query: ListCampaignsQueryDto) {
    return this.campaignsService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('campaigns:read')
  findOne(@Param('id') id: string) {
    return this.campaignsService.findById(id);
  }

  @Post()
  @RequirePermissions('campaigns:create')
  async create(@Body() dto: CreateCampaignDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.campaignsService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'campaigns',
      entityId: String(created._id),
      entityLabel: created.name,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('campaigns:update')
  async update(@Param('id') id: string, @Body() dto: UpdateCampaignDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.campaignsService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'campaigns',
      entityId: id,
      entityLabel: updated.name,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('campaigns:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.campaignsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'campaigns',
      entityId: id,
      req,
    });
    return result;
  }
}
