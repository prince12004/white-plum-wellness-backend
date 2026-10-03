import { IsEnum } from 'class-validator';
import { BOOKING_STATUSES, BookingStatus } from '../schemas/booking.schema';

export class UpdateBookingStatusDto {
  @IsEnum(BOOKING_STATUSES)
  status!: BookingStatus;
}
