import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateConcernDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() shortDescription?: string;

  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() overview?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) symptoms?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) causes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) recommendedServiceSlugs?: string[];
}
