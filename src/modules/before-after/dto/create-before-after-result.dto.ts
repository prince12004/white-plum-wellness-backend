import { IsOptional, IsString } from 'class-validator';

export class CreateBeforeAfterResultDto {
  @IsString() title!: string;
  @IsString() category!: string;
  @IsString() beforeImage!: string;
  @IsString() afterImage!: string;

  @IsOptional() @IsString() treatmentSlug?: string;
  @IsOptional() @IsString() concernSlug?: string;
  @IsOptional() @IsString() doctorSlug?: string;
  @IsOptional() @IsString() clinicSlug?: string;
  @IsOptional() @IsString() sessions?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() description?: string;
}
