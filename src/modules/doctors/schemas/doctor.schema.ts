import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type DoctorDocument = HydratedDocument<Doctor>;

@Schema({ timestamps: true })
export class Doctor extends Document {
  @Prop({ required: true, unique: true, index: true, trim: true })
  slug!: string;

  @Prop({ required: true, trim: true })
  name!: string;

  @Prop({ required: true })
  photo!: string;

  @Prop({ required: true })
  qualification!: string;

  @Prop({ default: 0 })
  experienceYears!: number;

  @Prop({ type: [String], default: [] })
  specialization!: string[];

  @Prop({ default: '' })
  bio!: string;

  @Prop({ type: [String], default: [] })
  languages!: string[];

  @Prop({ type: [String], default: [] })
  clinicSlugs!: string[];

  @Prop({ type: [String], default: [] })
  awards!: string[];
}

export const DoctorSchema = SchemaFactory.createForClass(Doctor);
