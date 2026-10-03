import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type LeadDocument = HydratedDocument<Lead>;

/**
 * Bare stub — exists only so AuditLog module names and future Clinic-scoped guards
 * have a real collection to reference. The full Lead CRM (status pipeline, follow-ups,
 * UTM capture, notes) is built in the WhatsApp/CRM phase.
 */
@Schema({ timestamps: true })
export class Lead extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  phone!: string;

  @Prop({ default: 'website' })
  source!: string;

  @Prop({ default: 'NEW' })
  status!: string;
}

export const LeadSchema = SchemaFactory.createForClass(Lead);
