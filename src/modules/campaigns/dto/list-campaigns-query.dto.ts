import { Type } from 'class-transformer';
import { IsEnum, IsOptional } from 'class-validator';
import { CAMPAIGN_STATUSES, CampaignStatus } from '../schemas/campaign.schema';

export class ListCampaignsQueryDto {
  @IsOptional() @Type(() => Number) page?: number;
  @IsOptional() @Type(() => Number) pageSize?: number;
  @IsOptional() @IsEnum(CAMPAIGN_STATUSES) status?: CampaignStatus;
}
