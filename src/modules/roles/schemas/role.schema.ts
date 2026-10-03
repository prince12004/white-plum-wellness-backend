import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Permission } from './permission.schema';

export type RoleDocument = HydratedDocument<Role>;

export const SYSTEM_ROLE_KEYS = [
  'SUPER_ADMIN',
  'ADMIN',
  'CONTENT_MANAGER',
  'MARKETING_MANAGER',
  'CLINIC_MANAGER',
  'COUNSELLOR',
  'DOCTOR',
] as const;

@Schema({ timestamps: true })
export class Role extends Document {
  @Prop({ required: true, unique: true, uppercase: true, trim: true, index: true })
  key!: string;

  @Prop({ required: true })
  label!: string;

  @Prop({ type: String, default: null })
  description!: string | null;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: Permission.name }], default: [] })
  permissions!: Types.ObjectId[];

  @Prop({ default: false })
  isSystem!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const RoleSchema = SchemaFactory.createForClass(Role);
