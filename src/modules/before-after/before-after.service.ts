import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateBeforeAfterResultDto } from './dto/create-before-after-result.dto';
import { ListBeforeAfterQueryDto } from './dto/list-before-after-query.dto';
import { UpdateBeforeAfterResultDto } from './dto/update-before-after-result.dto';
import { BeforeAfterResult, BeforeAfterResultDocument } from './schemas/before-after-result.schema';

@Injectable()
export class BeforeAfterService {
  constructor(
    @InjectModel(BeforeAfterResult.name) private readonly resultModel: Model<BeforeAfterResultDocument>,
  ) {}

  async findAll(query: ListBeforeAfterQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.category) filter.category = query.category;

    const [items, total] = await Promise.all([
      this.resultModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.resultModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async getCategories(): Promise<string[]> {
    return this.resultModel.distinct('category');
  }

  async findById(id: string) {
    const result = await this.resultModel.findById(id).lean();
    if (!result) throw new NotFoundException('Result not found');
    return result;
  }

  async create(dto: CreateBeforeAfterResultDto) {
    return this.resultModel.create(dto);
  }

  async update(id: string, dto: UpdateBeforeAfterResultDto) {
    const result = await this.resultModel.findById(id);
    if (!result) throw new NotFoundException('Result not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(result, patch);
    await result.save();
    return result;
  }

  async remove(id: string) {
    const result = await this.resultModel.findByIdAndDelete(id);
    if (!result) throw new NotFoundException('Result not found');
    return { success: true };
  }
}
