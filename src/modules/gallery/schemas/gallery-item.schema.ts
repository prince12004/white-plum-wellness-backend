import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type GalleryItemDocument = HydratedDocument<GalleryItem>;

@Schema({ timestamps: true })
export class GalleryItem extends Document {
  @Prop({ required: true, index: true })
  category!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ default: '' })
  caption!: string;
}

export const GalleryItemSchema = SchemaFactory.createForClass(GalleryItem);
