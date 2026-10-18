import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CategoryDocument = HydratedDocument<Category>;

@Schema({ timestamps: true })
export class Category extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ default: '' })
  description!: string;

  @Prop({ default: '' })
  icon!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ default: 0 })
  order!: number;
}

export const CategorySchema = SchemaFactory.createForClass(Category);
