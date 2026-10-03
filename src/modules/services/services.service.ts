import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateServiceDto } from './dto/create-service.dto';
import { ListServicesQueryDto } from './dto/list-services-query.dto';
import { UpdateServiceDto } from './dto/update-service.dto';
import { Service, ServiceDocument } from './schemas/service.schema';

/** List responses omit the large nested `detail` blob — only the detail-page fetch needs it. */
const LIST_PROJECTION = '-detail';

@Injectable()
export class ServicesService {
  constructor(@InjectModel(Service.name) private readonly serviceModel: Model<ServiceDocument>) {}

  async findAll(query: ListServicesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.categorySlug) filter.categorySlug = query.categorySlug;
    if (query.concernSlug) filter.concernSlugs = query.concernSlug;
    if (query.featured !== undefined) filter.featured = query.featured === 'true';
    if (query.popular !== undefined) filter.popular = query.popular === 'true';
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      this.serviceModel.find(filter, LIST_PROJECTION).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.serviceModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const service = await this.serviceModel.findOne({ slug }).lean();
    if (!service) throw new NotFoundException('Service not found');
    return service;
  }

  async findRelated(service: { slug: string; categorySlug: string }, limit = 3) {
    return this.serviceModel
      .find({ categorySlug: service.categorySlug, slug: { $ne: service.slug } }, LIST_PROJECTION)
      .limit(limit)
      .lean();
  }

  async create(dto: CreateServiceDto) {
    const existing = await this.serviceModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A service with this slug already exists');
    return this.serviceModel.create(dto);
  }

  async update(id: string, dto: UpdateServiceDto) {
    const service = await this.serviceModel.findById(id);
    if (!service) throw new NotFoundException('Service not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(service, patch);
    await service.save();
    return service;
  }

  async remove(id: string) {
    const service = await this.serviceModel.findByIdAndDelete(id);
    if (!service) throw new NotFoundException('Service not found');
    return { success: true };
  }
}
