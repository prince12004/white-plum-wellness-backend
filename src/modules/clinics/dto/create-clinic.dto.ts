import { Type } from 'class-transformer';
import { IsArray, IsBoolean, IsEmail, IsOptional, IsString, ValidateNested } from 'class-validator';

export class OpeningHourDto {
  @IsString() day!: string;
  @IsString() hours!: string;
}

export class CreateClinicDto {
  @IsString() name!: string;
  @IsString() slug!: string;
  @IsString() city!: string;

  @IsOptional() @IsBoolean() isActive?: boolean;
  @IsOptional() @IsString() area?: string;
  @IsOptional() @IsString() address?: string;
  @IsOptional() @IsString() phone?: string;
  @IsOptional() @IsString() whatsapp?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsString() image?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OpeningHourDto)
  openingHours?: OpeningHourDto[];

  @IsOptional() @IsArray() @IsString({ each: true }) categorySlugs?: string[];
}
