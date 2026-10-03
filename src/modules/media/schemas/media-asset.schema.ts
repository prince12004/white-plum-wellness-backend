import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type MediaAssetDocument = HydratedDocument<MediaAsset>;

/**
 * Tracks every image uploaded through the admin ImageUpload component, so the
 * Cloudinary URL that ends up on a Service/Doctor/etc. is backed by a reusable,
 * admin-editable asset record (name/alt text/category) rather than a bare string.
 */
@Schema({ timestamps: true })
export class MediaAsset extends Document {
  @Prop({ required: true })
  cloudinaryPublicId!: string;

  @Prop({ required: true })
  url!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ type: String, default: null, trim: true })
  title!: string | null;

  @Prop({ type: String, default: null, trim: true })
  altText!: string | null;

  @Prop({ type: String, default: null, trim: true, index: true })
  category!: string | null;

  @Prop({ type: Number, default: null })
  width!: number | null;

  @Prop({ type: Number, default: null })
  height!: number | null;

  @Prop({ type: String, default: null })
  format!: string | null;

  @Prop({ type: Number, default: null })
  bytes!: number | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  uploadedBy!: Types.ObjectId | null;
}

export const MediaAssetSchema = SchemaFactory.createForClass(MediaAsset);
