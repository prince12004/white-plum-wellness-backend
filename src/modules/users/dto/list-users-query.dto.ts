import { Type } from 'class-transformer';
import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { USER_STATUSES, UserStatus } from '../schemas/user.schema';

export class ListUsersQueryDto {
  @IsOptional()
  @Type(() => Number)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  pageSize?: number;

  @IsOptional()
  @IsMongoId()
  role?: string;

  @IsOptional()
  @IsEnum(USER_STATUSES)
  status?: UserStatus;

  @IsOptional()
  @IsString()
  search?: string;
}
