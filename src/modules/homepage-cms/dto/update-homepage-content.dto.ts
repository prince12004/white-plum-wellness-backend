import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

class HeroSlideDto {
  @IsString() eyebrow!: string;
  @IsString() title!: string;
  @IsString() description!: string;
  @IsString() image!: string;
}

export class UpdateHomepageContentDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => HeroSlideDto)
  heroSlides?: HeroSlideDto[];

  @IsOptional() @IsString() heroCtaLabel?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) featuredServiceSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) featuredPackageSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) featuredOfferSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) featuredTestimonialIds?: string[];
}
