import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsOptional, IsString, ValidateNested } from 'class-validator';
import { CmsSectionDto } from '../../../common/dto/cms-section.dto';

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

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsSectionDto)
  sections?: CmsSectionDto[];

  @IsOptional() @IsString() metaTitle?: string | null;
  @IsOptional() @IsString() metaDescription?: string | null;
  @IsOptional() @IsString() metaKeywords?: string | null;
  @IsOptional() @IsString() ogImage?: string | null;
  @IsOptional() @IsString() canonicalUrl?: string | null;
  @IsOptional() @IsBoolean() noIndex?: boolean;
}
