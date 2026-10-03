import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { Customer, CustomerDocument } from './schemas/customer.schema';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';

export interface ListCustomersQuery {
  page?: number;
  pageSize?: number;
  search?: string;
}

@Injectable()
export class CustomersService {
  constructor(@InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>) {}

  async findOrCreateByPhone(phone: string): Promise<CustomerDocument> {
    const existing = await this.customerModel.findOne({ phone });
    if (existing) return existing;
    return this.customerModel.create({ phone });
  }

  async findByIdWithRefreshHash(id: string) {
    return this.customerModel.findById(id).select('+refreshTokenHash').exec();
  }

  async findById(id: string) {
    const customer = await this.customerModel.findById(id).lean();
    if (!customer) throw new NotFoundException('Customer not found');
    return customer;
  }

  async updateProfile(id: string, dto: UpdateCustomerProfileDto) {
    const customer = await this.customerModel.findById(id);
    if (!customer) throw new NotFoundException('Customer not found');
    if (dto.name !== undefined) customer.name = dto.name;
    await customer.save();
    return customer;
  }

  async findAll(query: ListCustomersQuery) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.search) {
      filter.$or = [
        { name: { $regex: query.search, $options: 'i' } },
        { phone: { $regex: query.search, $options: 'i' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.customerModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.customerModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }

  async recordLogin(id: string) {
    await this.customerModel.updateOne({ _id: id }, { lastLoginAt: new Date() });
  }

  async setRefreshTokenHash(id: string, refreshTokenHash: string | null) {
    await this.customerModel.updateOne({ _id: id }, { refreshTokenHash });
  }
}
