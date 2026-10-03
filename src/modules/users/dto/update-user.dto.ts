import { IsEnum, IsMongoId, IsOptional, IsString, MinLength } from 'class-validator';
import { USER_STATUSES, UserStatus } from '../schemas/user.schema';

export class UpdateUserDto {
  @IsOptional()
  @IsString()
  @MinLength(2)
  name?: string;

  @IsOptional()
  @IsMongoId()
  roleId?: string;

  @IsOptional()
  @IsEnum(USER_STATUSES)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  phone?: string;
}
