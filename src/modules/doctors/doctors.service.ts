import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateDoctorDto } from './dto/create-doctor.dto';
import { ListDoctorsQueryDto } from './dto/list-doctors-query.dto';
import { UpdateDoctorDto } from './dto/update-doctor.dto';
import { Doctor, DoctorDocument } from './schemas/doctor.schema';

@Injectable()
export class DoctorsService {
  constructor(@InjectModel(Doctor.name) private readonly doctorModel: Model<DoctorDocument>) {}

  async findAll(query: ListDoctorsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.clinicSlug) filter.clinicSlugs = query.clinicSlug;
    if (query.search) filter.name = { $regex: query.search, $options: 'i' };

    const [items, total] = await Promise.all([
      this.doctorModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.doctorModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const doctor = await this.doctorModel.findOne({ slug }).lean();
    if (!doctor) throw new NotFoundException('Doctor not found');
    return doctor;
  }

  async create(dto: CreateDoctorDto) {
    const existing = await this.doctorModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('A doctor with this slug already exists');
    return this.doctorModel.create(dto);
  }

  async update(id: string, dto: UpdateDoctorDto) {
    const doctor = await this.doctorModel.findById(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(doctor, patch);
    await doctor.save();
    return doctor;
  }

  async remove(id: string) {
    const doctor = await this.doctorModel.findByIdAndDelete(id);
    if (!doctor) throw new NotFoundException('Doctor not found');
    return { success: true };
  }
}
