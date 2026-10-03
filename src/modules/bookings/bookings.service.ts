import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { normalizePagination, toPaginatedResult } from '../../common/utils/pagination.util';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { Booking, BookingDocument } from './schemas/booking.schema';

@Injectable()
export class BookingsService {
  constructor(@InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>) {}

  async create(dto: CreateBookingDto, customerId: string | null) {
    return this.bookingModel.create({
      ...dto,
      customerId: customerId ? new Types.ObjectId(customerId) : null,
    });
  }

  async findMine(customerId: string) {
    return this.bookingModel.find({ customerId: new Types.ObjectId(customerId) }).sort({ createdAt: -1 }).lean();
  }

  async findAll(query: ListBookingsQueryDto) {
    const { page, pageSize, skip } = normalizePagination(query);
    const filter: Record<string, unknown> = {};
    if (query.status) filter.status = query.status;
    if (query.customerId) filter.customerId = new Types.ObjectId(query.customerId);

    const [items, total] = await Promise.all([
      this.bookingModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(pageSize).lean(),
      this.bookingModel.countDocuments(filter),
    ]);

    return toPaginatedResult(items, total, page, pageSize);
  }

  async updateStatus(id: string, status: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    const before = booking.toObject();
    booking.status = status as BookingDocument['status'];
    await booking.save();
    return { booking, before };
  }

  async remove(id: string) {
    const booking = await this.bookingModel.findById(id);
    if (!booking) throw new NotFoundException('Booking not found');
    const before = booking.toObject();
    await booking.deleteOne();
    return { before };
  }
}
