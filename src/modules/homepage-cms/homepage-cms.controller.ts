import { Body, Controller, Get, Patch, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { UpdateHomepageContentDto } from './dto/update-homepage-content.dto';
import { HomepageCmsService } from './homepage-cms.service';

@Controller('homepage-cms')
export class HomepageCmsController {
  constructor(
    private readonly homepageCmsService: HomepageCmsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  get() {
    return this.homepageCmsService.getSingleton();
  }

  @Patch()
  @RequirePermissions('homepage-cms:update')
  async update(@Body() dto: UpdateHomepageContentDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const { doc, before } = await this.homepageCmsService.update(dto, user.userId);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'homepage-cms',
      entityId: String(doc._id),
      entityLabel: 'Homepage content',
      before,
      after: doc.toObject(),
      req,
    });
    return doc;
  }
}
