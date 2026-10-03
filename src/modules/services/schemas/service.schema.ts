import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class ProcessStep {
  @Prop({ required: true }) title!: string;
  @Prop({ required: true }) description!: string;
}
export const ProcessStepSchema = SchemaFactory.createForClass(ProcessStep);

@Schema({ _id: false })
export class FaqItem {
  @Prop({ required: true }) question!: string;
  @Prop({ required: true }) answer!: string;
}
export const FaqItemSchema = SchemaFactory.createForClass(FaqItem);

@Schema({ _id: false })
export class ServiceDetail {
  @Prop({ default: '' }) whatIsIt!: string;
  @Prop({ type: [String], default: [] }) whoIsItFor!: string[];
  @Prop({ type: [String], default: [] }) problemsAddressed!: string[];
  @Prop({ type: [String], default: [] }) benefits!: string[];
  @Prop({ default: '' }) howItWorks!: string;
  @Prop({ type: [ProcessStepSchema], default: [] }) process!: ProcessStep[];
  @Prop({ default: '' }) technology!: string;
  @Prop({ default: '' }) duration!: string;
  @Prop({ default: '' }) sessions!: string;
  @Prop({ default: '' }) results!: string;
  @Prop({ default: '' }) recovery!: string;
  @Prop({ type: [String], default: [] }) preCare!: string[];
  @Prop({ type: [String], default: [] }) postCare!: string[];
  @Prop({ type: [FaqItemSchema], default: [] }) faqs!: FaqItem[];
}
export const ServiceDetailSchema = SchemaFactory.createForClass(ServiceDetail);

export type ServiceDocument = HydratedDocument<Service>;

@Schema({ timestamps: true })
export class Service extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true, index: true })
  categorySlug!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  shortDescription!: string;

  @Prop({ required: true })
  image!: string;

  @Prop({ default: 0 })
  startingPrice!: number;

  @Prop({ default: false, index: true })
  featured!: boolean;

  @Prop({ default: false, index: true })
  popular!: boolean;

  @Prop({ type: [String], default: [] })
  concernSlugs!: string[];

  @Prop({ type: [String], default: [] })
  doctorSlugs!: string[];

  @Prop({ type: [String], default: [] })
  clinicSlugs!: string[];

  @Prop({ type: ServiceDetailSchema, default: () => ({}) })
  detail!: ServiceDetail;
}

export const ServiceSchema = SchemaFactory.createForClass(Service);
