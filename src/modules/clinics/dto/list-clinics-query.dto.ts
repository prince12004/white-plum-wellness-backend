import { Type } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

export class ListClinicsQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsString() city?: string;
}
