import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { ServiceDetailDto } from './service-detail.dto';

export class CreateServiceDto {
  @IsString() slug!: string;
  @IsString() categorySlug!: string;
  @IsString() name!: string;
  @IsString() shortDescription!: string;
  @IsString() image!: string;

  @IsOptional() @IsNumber() startingPrice?: number;
  @IsOptional() @IsBoolean() featured?: boolean;
  @IsOptional() @IsBoolean() popular?: boolean;

  @IsOptional() @IsArray() @IsString({ each: true }) concernSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) doctorSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) clinicSlugs?: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => ServiceDetailDto)
  detail?: ServiceDetailDto;
}
