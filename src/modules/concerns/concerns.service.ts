import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { Concern, ConcernDocument } from './schemas/concern.schema';
import { CreateConcernDto } from './dto/create-concern.dto';
import { ListConcernsQueryDto } from './dto/list-concerns-query.dto';
import { UpdateConcernDto } from './dto/update-concern.dto';

@Injectable()
export class ConcernsService {
  constructor(@InjectModel(Concern.name) private readonly concernModel: Model<ConcernDocument>) {}

  async findAll(query: ListConcernsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const [items, total] = await Promise.all([
      this.concernModel.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.concernModel.countDocuments(),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const concern = await this.concernModel.findOne({ slug }).lean();
    if (!concern) throw new NotFoundException('Concern not found');
    return concern;
  }

  async create(dto: CreateConcernDto) {
    const existing = await this.concernModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A concern with this slug already exists');
    return this.concernModel.create(dto);
  }

  async update(id: string, dto: UpdateConcernDto) {
    const concern = await this.concernModel.findById(id);
    if (!concern) throw new NotFoundException('Concern not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(concern, patch);
    await concern.save();
    return concern;
  }

  async remove(id: string) {
    const concern = await this.concernModel.findByIdAndDelete(id);
    if (!concern) throw new NotFoundException('Concern not found');
    return { success: true };
  }
}
