import { IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { BOOKING_SOURCES, BookingSource } from '../schemas/booking.schema';

export class CreateBookingDto {
  @IsOptional() @IsString() @MinLength(2) name?: string;
  @IsOptional() @IsString() @MinLength(7) phone?: string;

  @IsOptional() @IsEnum(BOOKING_SOURCES) source?: BookingSource;

  @IsOptional() @IsString() service?: string;
  @IsOptional() @IsString() package?: string;
  @IsOptional() @IsString() doctor?: string;
  @IsOptional() @IsString() clinic?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() offer?: string;
  @IsOptional() @IsString() concern?: string;
}
