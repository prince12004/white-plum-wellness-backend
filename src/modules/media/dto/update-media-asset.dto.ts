import { IsOptional, IsString } from 'class-validator';

export class UpdateMediaAssetDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsString() title?: string;
  @IsOptional() @IsString() altText?: string;
  @IsOptional() @IsString() category?: string;
}
