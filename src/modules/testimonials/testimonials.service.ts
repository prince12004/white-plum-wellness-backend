import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateTestimonialDto } from './dto/create-testimonial.dto';
import { ListTestimonialsQueryDto } from './dto/list-testimonials-query.dto';
import { UpdateTestimonialDto } from './dto/update-testimonial.dto';
import { Testimonial, TestimonialDocument } from './schemas/testimonial.schema';

@Injectable()
export class TestimonialsService {
  constructor(@InjectModel(Testimonial.name) private readonly testimonialModel: Model<TestimonialDocument>) {}

  async findAll(query: ListTestimonialsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.featured !== undefined) filter.featured = query.featured === 'true';

    const [items, total] = await Promise.all([
      this.testimonialModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.testimonialModel.countDocuments(filter),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findById(id: string) {
    const testimonial = await this.testimonialModel.findById(id).lean();
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return testimonial;
  }

  async create(dto: CreateTestimonialDto) {
    return this.testimonialModel.create(dto);
  }

  async update(id: string, dto: UpdateTestimonialDto) {
    const testimonial = await this.testimonialModel.findById(id);
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(testimonial, patch);
    await testimonial.save();
    return testimonial;
  }

  async remove(id: string) {
    const testimonial = await this.testimonialModel.findByIdAndDelete(id);
    if (!testimonial) throw new NotFoundException('Testimonial not found');
    return { success: true };
  }
}
