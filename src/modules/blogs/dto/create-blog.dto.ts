import { IsArray, IsOptional, IsString } from 'class-validator';

export class CreateBlogDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsString() category!: string;
  @IsString() excerpt!: string;
  @IsString() image!: string;
  @IsString() date!: string;

  @IsOptional() @IsArray() @IsString({ each: true }) content?: string[];
  @IsOptional() @IsString() author?: string;
  @IsOptional() @IsString() readingTime?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) relatedServiceSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) relatedConcernSlugs?: string[];
}
