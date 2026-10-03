import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { Clinic, ClinicDocument } from './schemas/clinic.schema';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { ListClinicsQueryDto } from './dto/list-clinics-query.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(@InjectModel(Clinic.name) private readonly clinicModel: Model<ClinicDocument>) {}

  async findAll(query: ListClinicsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.city) filter.city = query.city;

    const [items, total] = await Promise.all([
      this.clinicModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.clinicModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async getCities(): Promise<string[]> {
    return this.clinicModel.distinct('city');
  }

  async findBySlug(slug: string) {
    const clinic = await this.clinicModel.findOne({ slug }).lean();
    if (!clinic) throw new NotFoundException('Clinic not found');
    return clinic;
  }

  async create(dto: CreateClinicDto) {
    const existing = await this.clinicModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A clinic with this slug already exists');
    return this.clinicModel.create(dto);
  }

  async update(id: string, dto: UpdateClinicDto) {
    const clinic = await this.clinicModel.findById(id);
    if (!clinic) throw new NotFoundException('Clinic not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(clinic, patch);
    await clinic.save();
    return clinic;
  }

  async remove(id: string) {
    const clinic = await this.clinicModel.findByIdAndDelete(id);
    if (!clinic) throw new NotFoundException('Clinic not found');
    return { success: true };
  }
}
