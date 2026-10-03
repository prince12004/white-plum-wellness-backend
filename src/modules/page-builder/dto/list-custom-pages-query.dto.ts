import { Type } from 'class-transformer';
import { IsBoolean, IsOptional } from 'class-validator';

export class ListCustomPagesQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @Type(() => Boolean) @IsBoolean() isPublished?: boolean;
}
