import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateGalleryItemDto } from './dto/create-gallery-item.dto';
import { ListGalleryQueryDto } from './dto/list-gallery-query.dto';
import { UpdateGalleryItemDto } from './dto/update-gallery-item.dto';
import { GalleryItem, GalleryItemDocument } from './schemas/gallery-item.schema';

@Injectable()
export class GalleryService {
  constructor(@InjectModel(GalleryItem.name) private readonly galleryModel: Model<GalleryItemDocument>) {}

  async findAll(query: ListGalleryQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;

    const [items, total] = await Promise.all([
      this.galleryModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.galleryModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async create(dto: CreateGalleryItemDto) {
    return this.galleryModel.create(dto);
  }

  async update(id: string, dto: UpdateGalleryItemDto) {
    const item = await this.galleryModel.findById(id);
    if (!item) throw new NotFoundException('Gallery item not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(item, patch);
    await item.save();
    return item;
  }

  async remove(id: string) {
    const item = await this.galleryModel.findByIdAndDelete(id);
    if (!item) throw new NotFoundException('Gallery item not found');
    return { success: true };
  }
}
