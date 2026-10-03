import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CreateFaqDto } from './dto/create-faq.dto';
import { UpdateFaqDto } from './dto/update-faq.dto';
import { Faq, FaqDocument } from './schemas/faq.schema';

@Injectable()
export class FaqsService {
  constructor(@InjectModel(Faq.name) private readonly faqModel: Model<FaqDocument>) {}

  async findAll() {
    return this.faqModel.find().sort({ order: 1, createdAt: 1 }).lean();
  }

  async create(dto: CreateFaqDto) {
    return this.faqModel.create(dto);
  }

  async update(id: string, dto: UpdateFaqDto) {
    const faq = await this.faqModel.findById(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(faq, patch);
    await faq.save();
    return faq;
  }

  async remove(id: string) {
    const faq = await this.faqModel.findByIdAndDelete(id);
    if (!faq) throw new NotFoundException('FAQ not found');
    return { success: true };
  }
}
