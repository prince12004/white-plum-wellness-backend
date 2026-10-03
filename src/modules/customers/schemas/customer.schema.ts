import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CustomerStatus = 'ACTIVE' | 'BLOCKED';
export const CUSTOMER_STATUSES: CustomerStatus[] = ['ACTIVE', 'BLOCKED'];

export type CustomerDocument = HydratedDocument<Customer>;

/**
 * A wholly separate identity from admin `User` — phone-only, no email/password/
 * role. Deliberately decoupled from the RBAC system; a Customer is a patient who
 * logs in via mobile OTP to see their own bookings/favourites, nothing more.
 */
@Schema({ timestamps: true })
export class Customer extends Document {
  @Prop({ required: true, unique: true, index: true })
  phone!: string;

  @Prop({ type: String, default: null, trim: true, maxlength: 100 })
  name!: string | null;

  @Prop({ enum: CUSTOMER_STATUSES, default: 'ACTIVE', index: true })
  status!: CustomerStatus;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash!: string | null;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);
