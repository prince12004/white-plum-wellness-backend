import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type BookingStatus = 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED';
export const BOOKING_STATUSES: BookingStatus[] = ['PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED'];

export type BookingSource = 'FORM' | 'WHATSAPP_CLICK';
export const BOOKING_SOURCES: BookingSource[] = ['FORM', 'WHATSAPP_CLICK'];

export type BookingDocument = HydratedDocument<Booking>;

/**
 * Field names deliberately mirror `BookingContext` from apps/web/src/lib/whatsapp.ts
 * exactly — this is persisted alongside (not instead of) the WhatsApp hand-off, so a
 * logged-in customer's booking shows up in their dashboard history.
 */
@Schema({ timestamps: true })
export class Booking extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Customer', default: null, index: true })
  customerId!: Types.ObjectId | null;

  @Prop({ type: String, default: null, trim: true })
  name!: string | null;

  @Prop({ type: String, default: null, trim: true, index: true })
  phone!: string | null;

  @Prop({ enum: BOOKING_SOURCES, default: 'FORM', index: true })
  source!: BookingSource;

  @Prop({ type: String, default: null })
  service!: string | null;

  @Prop({ type: String, default: null })
  package!: string | null;

  @Prop({ type: String, default: null })
  doctor!: string | null;

  @Prop({ type: String, default: null })
  clinic!: string | null;

  @Prop({ type: String, default: null })
  city!: string | null;

  @Prop({ type: String, default: null })
  offer!: string | null;

  @Prop({ type: String, default: null })
  concern!: string | null;

  @Prop({ enum: BOOKING_STATUSES, default: 'PENDING', index: true })
  status!: BookingStatus;
}

export const BookingSchema = SchemaFactory.createForClass(Booking);
