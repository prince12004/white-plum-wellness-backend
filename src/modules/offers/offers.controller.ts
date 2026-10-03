import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersQueryDto } from './dto/list-offers-query.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { OffersService } from './offers.service';

@Controller('offers')
export class OffersController {
  constructor(
    private readonly offersService: OffersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListOffersQueryDto) {
    return this.offersService.findAll(query);
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.offersService.findBySlug(slug);
  }

  @Post()
  @RequirePermissions('offers:create')
  async create(@Body() dto: CreateOfferDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.offersService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'offers',
      entityId: String(created._id),
      entityLabel: created.title,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('offers:update')
  async update(@Param('id') id: string, @Body() dto: UpdateOfferDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.offersService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'offers',
      entityId: id,
      entityLabel: updated.title,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('offers:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.offersService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'offers',
      entityId: id,
      req,
    });
    return result;
  }
}
