import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListPackagesQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsString() categorySlug?: string;
}
