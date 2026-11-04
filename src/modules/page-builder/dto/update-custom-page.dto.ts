import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsIn, IsOptional, IsString, Matches, ValidateNested } from 'class-validator';
import { CmsSectionDto } from '../../../common/dto/cms-section.dto';

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SLUG_MESSAGE = 'URL slug can only contain lowercase letters, numbers and hyphens';

export class UpdateCustomPageDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() @Matches(SLUG_PATTERN, { message: SLUG_MESSAGE }) slug?: string;
  @IsOptional() @IsString() body?: string;

  @IsOptional() @IsString() metaTitle?: string | null;
  @IsOptional() @IsString() metaDescription?: string | null;
  @IsOptional() @IsString() metaKeywords?: string | null;
  @IsOptional() @IsString() ogImage?: string | null;
  @IsOptional() @IsString() canonicalUrl?: string | null;
  @IsOptional() @IsBoolean() noIndex?: boolean;
  @IsOptional() @IsIn(['site', 'landing']) layout?: 'site' | 'landing';

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CmsSectionDto)
  sections?: CmsSectionDto[];

  @IsOptional() @IsBoolean() isPublished?: boolean;
  @IsOptional() @IsBoolean() showInHeader?: boolean;
  @IsOptional() @IsBoolean() showInFooter?: boolean;
}
