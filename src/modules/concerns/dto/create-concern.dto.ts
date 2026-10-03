import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateConcernDto {
  @IsString() slug!: string;
  @IsString() name!: string;
  @IsString() image!: string;
  @IsString() shortDescription!: string;

  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsString() overview?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) symptoms?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) causes?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) recommendedServiceSlugs?: string[];
}
