import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';
import { PackageFaqItemDto } from './create-package.dto';

export class UpdatePackageDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() categorySlug?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) treatmentsIncluded?: string[];
  @IsOptional() @IsString() sessions?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsNumber() originalPrice?: number;
  @IsOptional() @IsNumber() offerPrice?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsString() doctorSlug?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) clinicSlugs?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PackageFaqItemDto)
  faqs?: PackageFaqItemDto[];
}
