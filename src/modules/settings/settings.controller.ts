import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { SettingsService } from './settings.service';

@Controller('settings')
export class SettingsController {
  constructor(
    private readonly settingsService: SettingsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  async get() {
    return this.settingsService.getSingleton();
  }

  @Patch()
  @RequirePermissions('settings:update')
  async update(@Body() dto: UpdateSettingsDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const { settings, before } = await this.settingsService.update(dto, user.userId);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'settings',
      entityId: String(settings._id),
      entityLabel: settings.businessName,
      before,
      after: settings.toObject(),
      req,
    });
    return settings;
  }
}
