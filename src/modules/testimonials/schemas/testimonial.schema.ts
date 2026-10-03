import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type TestimonialDocument = HydratedDocument<Testimonial>;

@Schema({ timestamps: true })
export class Testimonial extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  photo!: string;

  @Prop({ required: true, min: 1, max: 5 })
  rating!: number;

  @Prop({ required: true })
  review!: string;

  @Prop({ required: true })
  treatment!: string;

  @Prop({ default: '' })
  city!: string;

  @Prop({ default: '' })
  clinicSlug!: string;

  @Prop({ default: false, index: true })
  featured!: boolean;
}

export const TestimonialSchema = SchemaFactory.createForClass(Testimonial);
