import { Body, Controller, Delete, ForbiddenException, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { ChangePasswordDto } from './dto/change-password.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { ListUsersQueryDto } from './dto/list-users-query.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(
    private readonly usersService: UsersService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Get()
  @RequirePermissions('users:read')
  findAll(@Query() query: ListUsersQueryDto) {
    return this.usersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('users:read')
  findOne(@Param('id') id: string) {
    return this.usersService.findById(id);
  }

  @Post()
  @RequirePermissions('users:create')
  async create(@Body() dto: CreateUserDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.usersService.create(dto, user.userId);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'users',
      entityId: String(created._id),
      entityLabel: created.name,
      after: { name: created.name, email: created.email, role: created.role },
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('users:update')
  async update(
    @Param('id') id: string,
    @Body() dto: UpdateUserDto,
    @CurrentUser() currentUser: RequestUser,
    @Req() req: Request,
  ) {
    const { user, before } = await this.usersService.update(id, dto, currentUser.userId);
    await this.auditLogService.record({
      actorId: currentUser.userId,
      actorEmail: currentUser.email,
      action: dto.status ? 'STATUS_CHANGE' : 'UPDATE',
      module: 'users',
      entityId: id,
      entityLabel: user.name,
      before: { name: before.name, status: before.status, role: before.role },
      after: { name: user.name, status: user.status, role: user.role },
      req,
    });
    return user;
  }

  @Delete(':id')
  @RequirePermissions('users:delete')
  async remove(@Param('id') id: string, @CurrentUser() currentUser: RequestUser, @Req() req: Request) {
    const { user, before } = await this.usersService.softDelete(id, currentUser.userId);
    await this.auditLogService.record({
      actorId: currentUser.userId,
      actorEmail: currentUser.email,
      action: 'DELETE',
      module: 'users',
      entityId: id,
      entityLabel: user.name,
      before: { status: before.status },
      after: { status: user.status },
      req,
    });
    return { success: true };
  }

  /**
   * Permanent delete — distinct from the soft-delete `DELETE /:id` above (which just
   * suspends). Only Super Admin can reach this; the `users:delete` permission alone
   * (e.g. an ADMIN role) is not enough, matching how the product wants this scoped.
   */
  @Delete(':id/permanent')
  @RequirePermissions('users:delete')
  async hardDelete(@Param('id') id: string, @CurrentUser() currentUser: RequestUser, @Req() req: Request) {
    if (currentUser.roleKey !== 'SUPER_ADMIN') {
      throw new ForbiddenException('Only Super Admin can permanently delete an admin account');
    }
    const { before } = await this.usersService.hardDelete(id, currentUser.userId);
    await this.auditLogService.record({
      actorId: currentUser.userId,
      actorEmail: currentUser.email,
      action: 'DELETE',
      module: 'users',
      entityId: id,
      entityLabel: before.name,
      before: { name: before.name, email: before.email, status: before.status },
      req,
    });
    return { success: true };
  }

  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body() dto: ChangePasswordDto,
    @CurrentUser() currentUser: RequestUser,
    @Req() req: Request,
  ) {
    const isSelf = currentUser.userId === id;
    const canManageOthers = currentUser.permissions?.includes('users:update') || currentUser.roleKey === 'SUPER_ADMIN';
    if (!isSelf && !canManageOthers) {
      throw new ForbiddenException("Only users with users:update can reset another user's password");
    }
    await this.usersService.changePassword(id, dto, currentUser.userId, isSelf);
    await this.auditLogService.record({
      actorId: currentUser.userId,
      actorEmail: currentUser.email,
      action: 'PASSWORD_CHANGE',
      module: 'users',
      entityId: id,
      req,
    });
    return { success: true };
  }
}
