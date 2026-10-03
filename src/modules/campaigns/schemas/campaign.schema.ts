import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export const CAMPAIGN_CHANNELS = ['WHATSAPP', 'SMS', 'EMAIL', 'SOCIAL', 'OTHER'] as const;
export type CampaignChannel = (typeof CAMPAIGN_CHANNELS)[number];

export const CAMPAIGN_STATUSES = ['DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED'] as const;
export type CampaignStatus = (typeof CAMPAIGN_STATUSES)[number];

export type CampaignDocument = HydratedDocument<Campaign>;

@Schema({ timestamps: true })
export class Campaign extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, enum: CAMPAIGN_CHANNELS })
  channel!: CampaignChannel;

  @Prop({ required: true, enum: CAMPAIGN_STATUSES, default: 'DRAFT', index: true })
  status!: CampaignStatus;

  @Prop({ type: Date, default: null })
  startDate!: Date | null;

  @Prop({ type: Date, default: null })
  endDate!: Date | null;

  @Prop({ type: String, default: null })
  targetAudience!: string | null;

  @Prop({ type: String, default: null })
  notes!: string | null;

  @Prop({ default: 0 })
  budget!: number;
}

export const CampaignSchema = SchemaFactory.createForClass(Campaign);
