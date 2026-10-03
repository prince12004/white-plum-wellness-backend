import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class WhatsappNumberEntryDto {
  @IsOptional()
  @IsString()
  clinicId?: string | null;

  @IsString()
  number!: string;

  @IsOptional()
  @IsString()
  label?: string | null;
}

class SocialLinksDto {
  @IsOptional() @IsString() instagram?: string;
  @IsOptional() @IsString() facebook?: string;
  @IsOptional() @IsString() youtube?: string;
  @IsOptional() @IsString() linkedin?: string;
  @IsOptional() @IsString() whatsappChannel?: string;
}

class MarketingPixelsDto {
  @IsOptional() @IsString() googleAnalyticsId?: string;
  @IsOptional() @IsString() googleTagManagerId?: string;
  @IsOptional() @IsString() metaPixelId?: string;
  @IsOptional() @IsString() googleAdsConversionId?: string;
}

class SeoDefaultsDto {
  @IsOptional() @IsString() defaultTitle?: string;
  @IsOptional() @IsString() defaultDescription?: string;
  @IsOptional() @IsString() defaultOgImageUrl?: string;
}

class BusinessHourEntryDto {
  @IsString()
  day!: string;

  @IsOptional() @IsString() open?: string | null;
  @IsOptional() @IsString() close?: string | null;

  @IsOptional()
  @IsBoolean()
  isClosed?: boolean;
}

class AddressDto {
  @IsOptional() @IsString() line1?: string;
  @IsOptional() @IsString() line2?: string;
  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() state?: string;
  @IsOptional() @IsString() pincode?: string;
  @IsOptional() @IsString() country?: string;
  @IsOptional() @IsString() mapEmbedUrl?: string;
}

export class UpdateSettingsDto {
  @IsOptional() @IsString() businessName?: string;
  @IsOptional() @IsString() legalName?: string;
  @IsOptional() @IsString() logoUrl?: string;
  @IsOptional() @IsString() faviconUrl?: string;
  @IsOptional() @IsEmail() contactEmail?: string;
  @IsOptional() @IsString() contactPhone?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WhatsappNumberEntryDto)
  whatsappNumbers?: WhatsappNumberEntryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => SocialLinksDto)
  socialLinks?: SocialLinksDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => MarketingPixelsDto)
  marketingPixels?: MarketingPixelsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDefaultsDto)
  seoDefaults?: SeoDefaultsDto;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BusinessHourEntryDto)
  businessHours?: BusinessHourEntryDto[];

  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDto)
  address?: AddressDto;

  @IsOptional()
  @IsBoolean()
  maintenanceMode?: boolean;
}
