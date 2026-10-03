import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OtpChallengeDocument = HydratedDocument<OtpChallenge>;

/**
 * Only used by the local dev-fallback OTP provider (no Twilio/MSG91 keys set).
 * A separate collection rather than fields on Customer — a challenge can exist for
 * a phone number before any Customer document does, and its lifecycle (expiry,
 * attempts) is unrelated to the customer's own record.
 */
@Schema({ timestamps: true })
export class OtpChallenge extends Document {
  @Prop({ required: true, index: true })
  phone!: string;

  @Prop({ required: true, select: false })
  otpHash!: string;

  @Prop({ required: true })
  expiresAt!: Date;

  @Prop({ default: 0 })
  attempts!: number;

  @Prop({ required: true })
  resendAt!: Date;
}

export const OtpChallengeSchema = SchemaFactory.createForClass(OtpChallenge);
