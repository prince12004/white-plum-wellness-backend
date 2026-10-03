import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { FaqsService } from './faqs.service';

@Controller('faqs')
export class FaqsController {
  constructor(
    private readonly faqsService: FaqsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll() {
    return this.faqsService.findAll();
  }

  @Post()
  @RequirePermissions('faqs:create')
  async create(@Body() dto: CreateFaqDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.faqsService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'faqs',
      entityId: String(created._id),
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('faqs:update')
  async update(@Param('id') id: string, @Body() dto: UpdateFaqDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.faqsService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'faqs',
      entityId: id,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('faqs:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.faqsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'faqs',
      entityId: id,
      req,
    });
    return result;
  }
}
