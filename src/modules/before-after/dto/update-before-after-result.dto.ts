import { IsOptional, IsString } from 'class-validator';

export class UpdateBeforeAfterResultDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() beforeImage?: string;
  @IsOptional() @IsString() afterImage?: string;

  @IsOptional() @IsString() treatmentSlug?: string;
  @IsOptional() @IsString() concernSlug?: string;
  @IsOptional() @IsString() doctorSlug?: string;
  @IsOptional() @IsString() clinicSlug?: string;
  @IsOptional() @IsString() sessions?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() description?: string;
}
