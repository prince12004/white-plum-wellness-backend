import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class UpdateCustomPageDto {
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() slug?: string;
  @IsOptional() @IsString() body?: string;

  @IsOptional() @IsString() metaTitle?: string | null;
  @IsOptional() @IsString() metaDescription?: string | null;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
