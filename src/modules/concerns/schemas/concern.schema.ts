import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type ConcernDocument = HydratedDocument<Concern>;

@Schema({ timestamps: true })
export class Concern extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ default: '' })
  icon!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ default: '' })
  overview!: string;

  @Prop({ type: [String], default: [] })
  symptoms!: string[];

  @Prop({ type: [String], default: [] })
  causes!: string[];

  @Prop({ type: [String], default: [] })
  recommendedServiceSlugs!: string[];
}

export const ConcernSchema = SchemaFactory.createForClass(Concern);
