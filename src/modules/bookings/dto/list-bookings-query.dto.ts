import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional } from 'class-validator';
import { BOOKING_STATUSES, BookingStatus } from '../schemas/booking.schema';

export class ListBookingsQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsEnum(BOOKING_STATUSES)
  status?: BookingStatus;

  @IsOptional()
  @IsMongoId()
  customerId?: string;
}
