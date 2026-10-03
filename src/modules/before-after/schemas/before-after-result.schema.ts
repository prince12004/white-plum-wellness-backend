import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BeforeAfterResultDocument = HydratedDocument<BeforeAfterResult>;

@Schema({ timestamps: true, collection: 'before_after_results' })
export class BeforeAfterResult extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ required: true })
  beforeImage!: string;

  @Prop({ required: true })
  afterImage!: string;

  @Prop({ default: '' })
  treatmentSlug!: string;

  @Prop({ default: '' })
  concernSlug!: string;

  @Prop({ default: '' })
  doctorSlug!: string;

  @Prop({ default: '' })
  clinicSlug!: string;

  @Prop({ default: '' })
  sessions!: string;

  @Prop({ default: '' })
  duration!: string;

  @Prop({ default: '' })
  description!: string;
}

export const BeforeAfterResultSchema = SchemaFactory.createForClass(BeforeAfterResult);
