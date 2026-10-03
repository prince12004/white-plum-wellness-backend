import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ProcessStepDto {
  @IsString() title!: string;
  @IsString() description!: string;
}

export class FaqItemDto {
  @IsString() question!: string;
  @IsString() answer!: string;
}

export class ServiceDetailDto {
  @IsOptional() @IsString() whatIsIt?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) whoIsItFor?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) problemsAddressed?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) benefits?: string[];
  @IsOptional() @IsString() howItWorks?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProcessStepDto)
  process?: ProcessStepDto[];

  @IsOptional() @IsString() technology?: string;
  @IsOptional() @IsString() duration?: string;
  @IsOptional() @IsString() sessions?: string;
  @IsOptional() @IsString() results?: string;
  @IsOptional() @IsString() recovery?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) preCare?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) postCare?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FaqItemDto)
  faqs?: FaqItemDto[];
}
