import { IsDateString, IsEnum, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { CAMPAIGN_CHANNELS, CAMPAIGN_STATUSES, CampaignChannel, CampaignStatus } from '../schemas/campaign.schema';

export class UpdateCampaignDto {
  @IsOptional() @IsString() name?: string;

  @IsOptional() @IsEnum(CAMPAIGN_CHANNELS) channel?: CampaignChannel;

  @IsOptional() @IsEnum(CAMPAIGN_STATUSES) status?: CampaignStatus;

  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;

  @IsOptional() @IsString() targetAudience?: string;
  @IsOptional() @IsString() notes?: string;

  @IsOptional() @IsNumber() @Min(0) budget?: number;
}
