import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Booking, BookingDocument } from '../bookings/schemas/booking.schema';
import { Customer, CustomerDocument } from '../customers/schemas/customer.schema';

@Injectable()
export class AnalyticsService {
  constructor(
    @InjectModel(Booking.name) private readonly bookingModel: Model<BookingDocument>,
    @InjectModel(Customer.name) private readonly customerModel: Model<CustomerDocument>,
  ) {}

  async getOverview() {
    const since30d = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const [
      totalBookings,
      statusBreakdown,
      dailyTrend,
      topInterests,
      totalCustomers,
      newCustomers30d,
    ] = await Promise.all([
      this.bookingModel.countDocuments(),
      this.bookingModel.aggregate([{ $group: { _id: '$status', count: { $sum: 1 } } }]),
      this.bookingModel.aggregate([
        { $match: { createdAt: { $gte: since30d } } },
        { $group: { _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      this.bookingModel.aggregate([
        {
          $project: {
            interest: {
              $ifNull: ['$service', { $ifNull: ['$package', { $ifNull: ['$offer', { $ifNull: ['$concern', 'General enquiry'] }] }] }],
            },
          },
        },
        { $group: { _id: '$interest', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
        { $limit: 5 },
      ]),
      this.customerModel.countDocuments(),
      this.customerModel.countDocuments({ createdAt: { $gte: since30d } }),
    ]);

    const statusMap = Object.fromEntries(statusBreakdown.map((s) => [s._id, s.count]));

    return {
      totalBookings,
      statusBreakdown: {
        PENDING: statusMap.PENDING ?? 0,
        CONFIRMED: statusMap.CONFIRMED ?? 0,
        COMPLETED: statusMap.COMPLETED ?? 0,
        CANCELLED: statusMap.CANCELLED ?? 0,
      },
      dailyTrend: dailyTrend.map((d) => ({ date: d._id, count: d.count })),
      topInterests: topInterests.map((t) => ({ label: t._id, count: t.count })),
      totalCustomers,
      newCustomers30d,
    };
  }
}
