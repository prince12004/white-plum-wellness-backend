import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type BlogDocument = HydratedDocument<Blog>;

@Schema({ timestamps: true })
export class Blog extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ required: true })
  excerpt!: string;

  @Prop({ type: [String], default: [] })
  content!: string[];

  @Prop({ required: true })
  image!: string;

  @Prop({ default: '' })
  author!: string;

  @Prop({ required: true })
  date!: string;

  @Prop({ default: '' })
  readingTime!: string;

  @Prop({ type: [String], default: [] })
  relatedServiceSlugs!: string[];

  @Prop({ type: [String], default: [] })
  relatedConcernSlugs!: string[];
}

export const BlogSchema = SchemaFactory.createForClass(Blog);
