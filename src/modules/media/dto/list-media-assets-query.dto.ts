import { IsOptional, IsString } from 'class-validator';

export class ListMediaAssetsQueryDto {
  @IsOptional() page?: number;
  @IsOptional() pageSize?: number;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() search?: string;
}
