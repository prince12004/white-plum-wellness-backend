import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreatePackageDto } from './dto/create-package.dto';
import { ListPackagesQueryDto } from './dto/list-packages-query.dto';
import { UpdatePackageDto } from './dto/update-package.dto';
import { TreatmentPackage, TreatmentPackageDocument } from './schemas/package.schema';

@Injectable()
export class PackagesService {
  constructor(@InjectModel(TreatmentPackage.name) private readonly packageModel: Model<TreatmentPackageDocument>) {}

  async findAll(query: ListPackagesQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.categorySlug) filter.categorySlug = query.categorySlug;

    const [items, total] = await Promise.all([
      this.packageModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.packageModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const pkg = await this.packageModel.findOne({ slug }).lean();
    if (!pkg) throw new NotFoundException('Package not found');
    return pkg;
  }

  async create(dto: CreatePackageDto) {
    const existing = await this.packageModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A package with this slug already exists');
    return this.packageModel.create(dto);
  }

  async update(id: string, dto: UpdatePackageDto) {
    const pkg = await this.packageModel.findById(id);
    if (!pkg) throw new NotFoundException('Package not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(pkg, patch);
    await pkg.save();
    return pkg;
  }

  async remove(id: string) {
    const pkg = await this.packageModel.findByIdAndDelete(id);
    if (!pkg) throw new NotFoundException('Package not found');
    return { success: true };
  }
}
