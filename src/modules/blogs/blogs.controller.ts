import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req } from '@nestjs/common';
import { Request } from 'express';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { BlogsService } from './blogs.service';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ListBlogsQueryDto } from './dto/list-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Controller('blogs')
export class BlogsController {
  constructor(
    private readonly blogsService: BlogsService,
    private readonly auditLogService: AuditLogService,
  ) {}

  @Public()
  @Get()
  findAll(@Query() query: ListBlogsQueryDto) {
    return this.blogsService.findAll(query);
  }

  @Public()
  @Get('categories')
  getCategories() {
    return this.blogsService.getCategories();
  }

  @Public()
  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.blogsService.findBySlug(slug);
  }

  @Public()
  @Get(':slug/related')
  async findRelated(@Param('slug') slug: string) {
    const blog = await this.blogsService.findBySlug(slug);
    return this.blogsService.findRelated(blog);
  }

  @Post()
  @RequirePermissions('blogs:create')
  async create(@Body() dto: CreateBlogDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const created = await this.blogsService.create(dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'CREATE',
      module: 'blogs',
      entityId: String(created._id),
      entityLabel: created.title,
      req,
    });
    return created;
  }

  @Patch(':id')
  @RequirePermissions('blogs:update')
  async update(@Param('id') id: string, @Body() dto: UpdateBlogDto, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const updated = await this.blogsService.update(id, dto);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'UPDATE',
      module: 'blogs',
      entityId: id,
      entityLabel: updated.title,
      req,
    });
    return updated;
  }

  @Delete(':id')
  @RequirePermissions('blogs:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const result = await this.blogsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'blogs',
      entityId: id,
      req,
    });
    return result;
  }
}
