import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CustomPage, CustomPageDocument } from './schemas/custom-page.schema';
import { CreateCustomPageDto } from './dto/create-custom-page.dto';
import { ListCustomPagesQueryDto } from './dto/list-custom-pages-query.dto';
import { UpdateCustomPageDto } from './dto/update-custom-page.dto';

@Injectable()
export class PageBuilderService {
  constructor(@InjectModel(CustomPage.name) private readonly customPageModel: Model<CustomPageDocument>) {}

  async findAllPublic(query: ListCustomPagesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter = { isPublished: true };

    const [items, total] = await Promise.all([
      this.customPageModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.customPageModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findAllAdmin(query: ListCustomPagesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.isPublished !== undefined) filter.isPublished = query.isPublished;

    const [items, total] = await Promise.all([
      this.customPageModel.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.customPageModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlugPublic(slug: string) {
    const page = await this.customPageModel.findOne({ slug, isPublished: true }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findBySlugAdmin(slug: string) {
    const page = await this.customPageModel.findOne({ slug }).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async findById(id: string) {
    const page = await this.customPageModel.findById(id).lean();
    if (!page) throw new NotFoundException('Page not found');
    return page;
  }

  async create(dto: CreateCustomPageDto) {
    const existing = await this.customPageModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A page with this slug already exists');
    return this.customPageModel.create(dto);
  }

  async update(id: string, dto: UpdateCustomPageDto) {
    const page = await this.customPageModel.findById(id);
    if (!page) throw new NotFoundException('Page not found');
    if (dto.slug && dto.slug !== page.slug) {
      const existing = await this.customPageModel.findOne({ slug: dto.slug });
      if (existing) throw new ConflictException('A page with this slug already exists');
    }
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(page, patch);
    await page.save();
    return page;
  }

  async remove(id: string) {
    const page = await this.customPageModel.findByIdAndDelete(id);
    if (!page) throw new NotFoundException('Page not found');
    return { success: true };
  }
}
