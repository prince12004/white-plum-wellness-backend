import { IsInt, IsOptional, IsString } from 'class-validator';

export class CreateCategoryDto {
  @IsString() slug!: string;
  @IsString() name!: string;
  @IsString() shortDescription!: string;
  @IsString() image!: string;

  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() icon?: string;
  @IsOptional() @IsInt() order?: number;
}
