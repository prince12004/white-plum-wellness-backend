import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';

@Schema({ _id: false, minimize: false })
export class CmsSection {
  @Prop({ required: true }) id!: string;
  @Prop({ required: true }) type!: string;
  @Prop() label?: string;
  @Prop({ default: true }) isActive!: boolean;
  @Prop({ type: MongooseSchema.Types.Mixed, default: {} }) content!: Record<string, unknown>;
}

export const CmsSectionSchema = SchemaFactory.createForClass(CmsSection);
