import { IsBoolean, IsOptional, IsString } from 'class-validator';

export class CreateCustomPageDto {
  @IsString() title!: string;
  @IsString() slug!: string;
  @IsString() body!: string;

  @IsOptional() @IsString() metaTitle?: string | null;
  @IsOptional() @IsString() metaDescription?: string | null;
  @IsOptional() @IsBoolean() isPublished?: boolean;
}
