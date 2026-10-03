import { IsOptional, IsString } from 'class-validator';

export class UpdateGalleryItemDto {
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() image?: string;
  @IsOptional() @IsString() caption?: string;
}
