import { IsBoolean, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateTestimonialDto {
  @IsString() name!: string;
  @IsString() photo!: string;
  @IsNumber() @Min(1) @Max(5) rating!: number;
  @IsString() review!: string;
  @IsString() treatment!: string;

  @IsOptional() @IsString() city?: string;
  @IsOptional() @IsString() clinicSlug?: string;
  @IsOptional() @IsBoolean() featured?: boolean;
}
