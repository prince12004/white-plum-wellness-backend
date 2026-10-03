import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class PackageFaqItem {
  @Prop({ required: true }) question!: string;
  @Prop({ required: true }) answer!: string;
}
export const PackageFaqItemSchema = SchemaFactory.createForClass(PackageFaqItem);

export type TreatmentPackageDocument = HydratedDocument<TreatmentPackage>;

@Schema({ timestamps: true, collection: 'packages' })
export class TreatmentPackage extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, index: true })
  categorySlug!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ required: true })
  description!: string;

  @Prop({ type: [String], default: [] })
  treatmentsIncluded!: string[];

  @Prop({ default: '' })
  sessions!: string;

  @Prop({ default: '' })
  duration!: string;

  @Prop({ default: 0 })
  originalPrice!: number;

  @Prop({ default: 0 })
  offerPrice!: number;

  @Prop({ type: [String], default: [] })
  benefits!: string[];

  @Prop({ default: '' })
  doctorSlug!: string;

  @Prop({ type: [String], default: [] })
  clinicSlugs!: string[];

  @Prop({ type: [PackageFaqItemSchema], default: [] })
  faqs!: PackageFaqItem[];
}

export const TreatmentPackageSchema = SchemaFactory.createForClass(TreatmentPackage);
