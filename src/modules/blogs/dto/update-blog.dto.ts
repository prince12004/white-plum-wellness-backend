import { IsArray, IsOptional, IsString } from 'class-validator';

export class UpdateBlogDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() excerpt?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() date?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) content?: string[];
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() readingTime?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedServiceSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedConcernSlugs?: string[];
}
