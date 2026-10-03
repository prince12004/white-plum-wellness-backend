import { IsString, Matches } from 'class-validator';

export class VerifyOtpDto {
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,15}$/, { message: 'Enter a valid mobile number' })
  phone!: string;

  @IsString()
  @Matches(/^\d{4,8}$/, { message: 'Enter a valid code' })
  code!: string;
}
