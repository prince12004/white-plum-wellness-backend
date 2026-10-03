import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListBlogsQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsString() concernSlug?: string;
}
