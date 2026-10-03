import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument } from 'mongoose';

export type PermissionAction = 'create' | 'read' | 'update' | 'delete' | 'publish' | 'manage';

export const PERMISSION_ACTIONS: PermissionAction[] = [
  'create',
  'read',
  'update',
  'delete',
  'publish',
  'manage',
];

export type PermissionDocument = HydratedDocument<Permission>;

@Schema({ timestamps: true })
export class Permission extends Document {
  @Prop({ required: true, unique: true, index: true })
  key!: string; // "module:action"

  @Prop({ required: true, index: true })
  module!: string;

  @Prop({ required: true, enum: PERMISSION_ACTIONS })
  action!: PermissionAction;

  @Prop({ type: String, default: null })
  description!: string | null;
}

export const PermissionSchema = SchemaFactory.createForClass(Permission);
