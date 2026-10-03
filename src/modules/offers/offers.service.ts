import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateOfferDto } from './dto/create-offer.dto';
import { ListOffersQueryDto } from './dto/list-offers-query.dto';
import { UpdateOfferDto } from './dto/update-offer.dto';
import { Offer, OfferDocument } from './schemas/offer.schema';

@Injectable()
export class OffersService {
  constructor(@InjectModel(Offer.name) private readonly offerModel: Model<OfferDocument>) {}

  async findAll(query: ListOffersQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const [items, total] = await Promise.all([
      this.offerModel.find().sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.offerModel.countDocuments(),
    ]);
    return toPaginatedResult(items, total, page, pageSize);
  }

  async findBySlug(slug: string) {
    const offer = await this.offerModel.findOne({ slug }).lean();
    if (!offer) throw new NotFoundException('Offer not found');
    return offer;
  }

  async create(dto: CreateOfferDto) {
    const existing = await this.offerModel.findOne({ slug: dto.slug });
    if (existing) throw new ConflictException('An offer with this slug already exists');
    return this.offerModel.create(dto);
  }

  async update(id: string, dto: UpdateOfferDto) {
    const offer = await this.offerModel.findById(id);
    if (!offer) throw new NotFoundException('Offer not found');
    const patch = Object.fromEntries(Object.entries(dto).filter(([, v]) => v !== undefined));
    Object.assign(offer, patch);
    await offer.save();
    return offer;
  }

  async remove(id: string) {
    const offer = await this.offerModel.findByIdAndDelete(id);
    if (!offer) throw new NotFoundException('Offer not found');
    return { success: true };
  }
}
