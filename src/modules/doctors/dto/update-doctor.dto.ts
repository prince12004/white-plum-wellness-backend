import { IsArray, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateDoctorDto {
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() photo?: string;
  @IsOptional() @IsString() qualification?: string;

  @IsOptional() @IsNumber() experienceYears?: number;
  @IsOptional() @IsArray() @IsString({ each: true }) specialization?: string[];
  @IsOptional() @IsString() bio?: string;
  @IsOptional() @IsArray() @IsString({ each: true }) languages?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) clinicSlugs?: string[];
  @IsOptional() @IsArray() @IsString({ each: true }) awards?: string[];
}
