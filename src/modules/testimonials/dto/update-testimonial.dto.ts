import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateTestimonialDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsNumber() @Min(1) @Max(5) rating?: number;
  @IsOptional() @IsString() review?: string;
  @IsOptional() @IsString() treatment?: string;

  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() clinicSlug?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
}
