import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListDoctorsQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsString() clinicSlug?: string;
  @IsOptional() @IsString() search?: string;
}
