import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type OfferDocument = HydratedDocument<Offer>;

@Schema({ timestamps: true })
export class Offer extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ default: '' })
  offerType!: string;

  @Prop({ type: String, default: null })
  treatmentSlug!: string | null;

  @Prop({ type: Number, default: null })
  originalPrice!: number | null;

  @Prop({ type: Number, default: null })
  offerPrice!: number | null;

  @Prop({ required: true })
  validUntil!: string;

  @Prop({ type: [String], default: [] })
  terms!: string[];

  @Prop({ type: [String], default: [] })
  clinicSlugs!: string[];
}

export const OfferSchema = SchemaFactory.createForClass(Offer);
