import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateOfferDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() validUntil?: string;

  @IsOptional() @IsString() offerType?: string;
  @IsOptional() @IsString() treatmentSlug?: string | null;
  @IsOptional() @IsNumber() originalPrice?: number | null;
  @IsOptional() @IsNumber() offerPrice?: number | null;
  @IsOptional() @IsArray() @IsString({ each: true }) terms?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) clinicSlugs?: string[];
}
