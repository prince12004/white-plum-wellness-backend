import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

@Schema({ _id: false })
export class OpeningHour {
  @Prop({ required: true }) day!: string;
  @Prop({ required: true }) hours!: string;
}
export const OpeningHourSchema = SchemaFactory.createForClass(OpeningHour);

export type ClinicDocument = HydratedDocument<Clinic>;

@Schema({ timestamps: true })
export class Clinic extends Document {
  @Prop({ required: true })
  name!: string;

  @Prop({ required: true, unique: true, index: true })
  slug!: string;

  @Prop({ default: true })
  isActive!: boolean;

  @Prop({ required: true, index: true })
  city!: string;

  @Prop({ default: '' })
  area!: string;

  @Prop({ default: '' })
  address!: string;

  @Prop({ default: '' })
  phone!: string;

  @Prop({ default: '' })
  whatsapp!: string;

  @Prop({ default: '' })
  email!: string;

  @Prop({ default: '' })
  image!: string;

  @Prop({ type: [OpeningHourSchema], default: [] })
  openingHours!: OpeningHour[];

  @Prop({ type: [String], default: [] })
  categorySlugs!: string[];
}

export const ClinicSchema = SchemaFactory.createForClass(Clinic);
