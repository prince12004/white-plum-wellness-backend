import { Type } from 'class-transformer';
import { IsBooleanString, IsOptional } from 'class-validator';

export class ListTestimonialsQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsBooleanString() featured?: string;
}
