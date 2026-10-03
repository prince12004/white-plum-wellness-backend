import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Schema as MongooseSchema, Types } from 'mongoose';
import { Role } from '../../roles/schemas/role.schema';

export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
export const USER_STATUSES: UserStatus[] = ['ACTIVE', 'INACTIVE', 'SUSPENDED'];

export type UserDocument = HydratedDocument<User>;

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true, trim: true, maxlength: 100 })
  name!: string;

  @Prop({ required: true, unique: true, lowercase: true, trim: true, index: true })
  email!: string;

  @Prop({ required: true, select: false })
  passwordHash!: string;

  @Prop({ type: Types.ObjectId, ref: Role.name, required: true, index: true })
  role!: Types.ObjectId;

  @Prop({ enum: USER_STATUSES, default: 'ACTIVE', index: true })
  status!: UserStatus;

  @Prop({ type: String, default: null })
  avatarUrl!: string | null;

  @Prop({ type: String, default: null })
  phone!: string | null;

  @Prop({ type: Date, default: null })
  lastLoginAt!: Date | null;

  @Prop({ type: String, default: null, select: false })
  refreshTokenHash!: string | null;

  @Prop({ type: [{ type: MongooseSchema.Types.ObjectId, ref: 'Clinic' }], default: [] })
  clinicScope!: Types.ObjectId[];

  @Prop({ default: false })
  mustChangePassword!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  createdBy!: Types.ObjectId | null;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
