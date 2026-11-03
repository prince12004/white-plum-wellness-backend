import { IsBoolean, IsObject, IsOptional, IsString } from 'class-validator';

export class CmsSectionDto {
  @IsString() id!: string;
  @IsString() type!: string;
  @IsOptional() @IsString() label?: string;
  @IsBoolean() isActive!: boolean;
  @IsObject() content!: Record<string, unknown>;
}
