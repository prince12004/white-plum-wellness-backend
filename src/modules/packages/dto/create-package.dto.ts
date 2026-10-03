import { Type } from 'class-transformer';
import { IsArray, IsNumber, IsOptional, IsString, ValidateNested } from 'class-validator';

export class PackageFaqItemDto {
  @IsString() question!: string;
  @IsString() answer!: string;
}

export class CreatePackageDto {
  @IsString() slug!: string;
  @IsString() name!: string;
  @IsString() categorySlug!: string;
  @IsString() image!: string;
  @IsString() description!: string;

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
