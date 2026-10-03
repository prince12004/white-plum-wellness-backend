import { Type } from 'class-transformer';
import { IsBooleanString, IsOptional, IsString } from 'class-validator';

export class ListServicesQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;

  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() concernSlug?: string;
  @IsOptional() @IsString() search?: string;
  @IsOptional() @IsBooleanString() featured?: string;
  @IsOptional() @IsBooleanString() popular?: string;
}
