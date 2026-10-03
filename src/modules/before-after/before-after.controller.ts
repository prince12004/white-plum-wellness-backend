import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BeforeAfterService } from './before-after.service';
import { CreateBeforeAfterResultDto } from './dto/create-before-after-result.dto';
import { ListBeforeAfterQueryDto } from './dto/list-before-after-query.dto';
import { UpdateBeforeAfterResultDto } from './dto/update-before-after-result.dto';

@Controller('before-after')
export class BeforeAfterController {
  constructor(
    private readonly beforeAfterService: BeforeAfterService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListBeforeAfterQueryDto) {
    return this.beforeAfterService.findAll(query);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.beforeAfterService.getCategories();
  }

  @Public()
  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.beforeAfterService.findById(id);
  }

  @Post()
  @RequirePermissions('before-after:create')
  async create(@Body() dto: CreateBeforeAfterResultDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.beforeAfterService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'before-after',
      entityId: String(created._id),
      entityLabel: created.title,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('before-after:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateBeforeAfterResultDto,
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ) {
    const updated = await this.beforeAfterService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'before-after',
      entityId: id,
      entityLabel: updated.title,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('before-after:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.beforeAfterService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'before-after',
      entityId: id,
      req,
    });
    return result;
  }
}
