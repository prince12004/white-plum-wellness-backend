import { IsString, Matches } from 'class-validator';

export class RequestOtpDto {
  @IsString()
  @Matches(/^\+?[0-9\s()-]{7,15}$/, { message: 'Enter a valid mobile number' })
  phone!: string;
}
