import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';
import { CmsSection, CmsSectionSchema } from '../../../common/schemas/cms-section.schema';

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

  @Prop({ type: String, default: null })
  metaKeywords!: string | null;

  @Prop({ type: String, default: null })
  ogImage!: string | null;

  @Prop({ type: String, default: null })
  canonicalUrl!: string | null;

  @Prop({ default: false })
  noIndex!: boolean;

  @Prop({ type: String, enum: ['site', 'landing'], default: 'site' })
  layout!: 'site' | 'landing';

  // No default: pages saved before sections existed keep rendering from `body`.
  @Prop({ type: [CmsSectionSchema], default: undefined })
  sections?: CmsSection[];

  @Prop({ type: String, default: null })
  systemKey!: string | null;

  @Prop({ default: '' })
  body!: string;

  @Prop({ default: false })
  isPublished!: boolean;

  @Prop({ default: false })
  showInHeader!: boolean;

  @Prop({ default: false })
  showInFooter!: boolean;
}

export const CustomPageSchema = SchemaFactory.createForClass(CustomPage);
