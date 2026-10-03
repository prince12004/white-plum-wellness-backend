import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListGalleryQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsString() category?: string;
}
