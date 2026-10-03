import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateOfferDto {
  @IsString() slug!: string;
  @IsString() title!: string;
  @IsString() image!: string;
  @IsString() description!: string;
  @IsString() validUntil!: string;

  @IsOptional() @IsString() offerType?: string;
  @IsOptional() @IsString() treatmentSlug?: string | null;
  @IsOptional() @IsNumber() originalPrice?: number | null;
  @IsOptional() @IsNumber() offerPrice?: number | null;
  @IsOptional() @IsArray() @IsString({ each: true }) terms?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) clinicSlugs?: string[];
}
