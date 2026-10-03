import { Type } from 'class-transformer';
import { IsOptional } from 'class-validator';

export class ListOffersQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
}
