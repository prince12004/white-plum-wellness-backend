import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type AuditAction =
  | 'LOGIN'
  | 'LOGOUT'
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'PUBLISH'
  | 'UNPUBLISH'
  | 'STATUS_CHANGE'
  | 'PASSWORD_CHANGE';

export const AUDIT_ACTIONS: AuditAction[] = [
  'LOGIN',
  'LOGOUT',
  'CREATE',
  'UPDATE',
  'DELETE',
  'PUBLISH',
  'UNPUBLISH',
  'STATUS_CHANGE',
  'PASSWORD_CHANGE',
];

export type AuditLogDocument = HydratedDocument<AuditLog>;

@Schema({ timestamps: { createdAt: true, updatedAt: false }, collection: 'audit_logs' })
export class AuditLog extends Document {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true, index: true })
  actor!: Types.ObjectId;

  @Prop({ required: true })
  actorEmail!: string;

  @Prop({ required: true, enum: AUDIT_ACTIONS })
  action!: AuditAction;

  @Prop({ required: true, index: true })
  module!: string;

  @Prop({ type: Types.ObjectId, default: null })
  entityId!: Types.ObjectId | null;

  @Prop({ type: String, default: null })
  entityLabel!: string | null;

  @Prop({ type: Object, default: null })
  before!: Record<string, unknown> | null;

  @Prop({ type: Object, default: null })
  after!: Record<string, unknown> | null;

  @Prop({ type: String, default: null })
  ipAddress!: string | null;

  @Prop({ type: String, default: null })
  userAgent!: string | null;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);
AuditLogSchema.index({ module: 1, createdAt: -1 });
