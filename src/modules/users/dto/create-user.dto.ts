import { IsEmail, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsMongoId()
  roleId!: string;

  @IsOptional()
  @IsString()
  phone?: string;
}
