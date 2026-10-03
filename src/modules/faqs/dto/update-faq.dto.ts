import { IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateFaqDto {
  @IsOptional() @IsString() question?: string;
  @IsOptional() @IsString() answer?: string;
  @IsOptional() @IsNumber() order?: number;
}
