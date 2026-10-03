import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type CustomPageDocument = HydratedDocument<CustomPage>;

@Schema({ timestamps: true })
export class CustomPage extends Document {
  @Prop({ required: true })
  title!: string;

  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ type: String, default: null })
  metaTitle!: string | null;

  @Prop({ type: String, default: null })
  metaDescription!: string | null;

  @Prop({ required: true })
  body!: string;

  @Prop({ default: false })
  isPublished!: boolean;
}

export const CustomPageSchema = SchemaFactory.createForClass(CustomPage);
