import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { Blog, BlogDocument } from './schemas/blog.schema';
import { CreateBlogDto } from './dto/create-blog.dto';
import { ListBlogsQueryDto } from './dto/list-blogs-query.dto';
import { UpdateBlogDto } from './dto/update-blog.dto';

@Injectable()
export class BlogsService {
  constructor(@InjectModel(Blog.name) private readonly blogModel: Model<BlogDocument>) {}

  async findAll(query: ListBlogsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;
    if (query.concernSlug) filter.relatedConcernSlugs = query.concernSlug;
    if (query.search) filter.title = { $regex: query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      this.blogModel.find(filter).sort({ date: -1 }).skip(skip).limit(pageSize).lean(),
      this.blogModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async getCategories(): Promise<string[]> {
    return this.blogModel.distinct('category');
  }

  async findBySlug(slug: string) {
    const blog = await this.blogModel.findOne({ slug }).lean();
    if (!blog) throw new NotFoundException('Blog not found');
    return blog;
  }

  async findRelated(blog: { slug: string; relatedConcernSlugs: string[] }, limit = 3) {
    return this.blogModel
      .find({ slug: { $ne: blog.slug }, relatedConcernSlugs: { $in: blog.relatedConcernSlugs } })
      .limit(limit)
      .lean();
  }

  async create(dto: CreateBlogDto) {
    const existing = await this.blogModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A blog with this slug already exists');
    return this.blogModel.create(dto);
  }

  async update(id: string, dto: UpdateBlogDto) {
    const blog = await this.blogModel.findById(id);
    if (!blog) throw new NotFoundException('Blog not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(blog, patch);
    await blog.save();
    return blog;
  }

  async remove(id: string) {
    const blog = await this.blogModel.findByIdAndDelete(id);
    if (!blog) throw new NotFoundException('Blog not found');
    return { success: true };
  }
}
