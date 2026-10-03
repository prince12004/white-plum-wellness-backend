import { Body, Controller, Delete, Get, Param, Patch, Post, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@Controller()
export class RolesController {
  constructor(
    private readonly rolesService: RolesService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get('roles')
  @RequirePermissions('roles:read')
  findAll() {
    return this.rolesService.findAll();
  }

  @Get('permissions')
  @RequirePermissions('roles:read')
  listPermissions() {
    return this.rolesService.listPermissions();
  }

  @Get('roles/:id')
  @RequirePermissions('roles:read')
  findOne(@Param('id') id: string) {
    return this.rolesService.findById(id);
  }

  @Post('roles')
  @RequirePermissions('roles:create')
  async create(@Body() dto: CreateRoleDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const role = await this.rolesService.create(dto, user.userId);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'roles',
      entityId: String(role._id),
      entityLabel: role.label,
      after: role.toObject(),
      req,
    });
    return role;
  }

  @Patch('roles/:id')
  @RequirePermissions('roles:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateRoleDto,
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ) {
    const { role, before } = await this.rolesService.update(id, dto, user.userId);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'roles',
      entityId: id,
      entityLabel: role.label,
      before,
      after: role.toObject(),
      req,
    });
    return role;
  }

  @Delete('roles/:id')
  @RequirePermissions('roles:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const role = await this.rolesService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'roles',
      entityId: id,
      entityLabel: role.label,
      before: role.toObject(),
      req,
    });
    return { success: true };
  }
}
