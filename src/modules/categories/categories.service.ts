import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { Category, CategoryDocument } from './schemas/category.schema';
import { CreateCategoryDto } from './dto/create-category.dto';
import { ListCategoriesQueryDto } from './dto/list-categories-query.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
  constructor(@InjectModel(Category.name) private readonly categoryModel: Model<CategoryDocument>) {}

  async findAll(query: ListCategoriesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const [items, total] = await Promise.all([
      this.categoryModel.find().sort({ order: 1, name: 1 }).skip(skip).limit(pageSize).lean(),
      this.categoryModel.countDocuments(),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const category = await this.categoryModel.findOne({ slug }).lean();
    if (!category) throw new NotFoundException('Category not found');
    return category;
  }

  async create(dto: CreateCategoryDto) {
    const existing = await this.categoryModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A category with this slug already exists');
    return this.categoryModel.create(dto);
  }

  async update(id: string, dto: UpdateCategoryDto) {
    const category = await this.categoryModel.findById(id);
    if (!category) throw new NotFoundException('Category not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(category, patch);
    await category.save();
    return category;
  }

  async remove(id: string) {
    const category = await this.categoryModel.findByIdAndDelete(id);
    if (!category) throw new NotFoundException('Category not found');
    return { success: true };
  }
}
