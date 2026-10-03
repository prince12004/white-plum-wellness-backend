import { IsOptional, IsString } from 'class-validator';

export class CreateGalleryItemDto {
  @IsString() category!: string;
  @IsString() image!: string;

  @IsOptional() @IsString() caption?: string;
}
