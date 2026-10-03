import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

@Schema({ _id: false })
class WhatsappNumberEntry {
  @Prop({ type: Types.ObjectId, ref: 'Clinic', default: null })
  clinicId!: Types.ObjectId | null;

  @Prop({ required: true })
  number!: string;

  @Prop({ type: String, default: null })
  label!: string | null;
}
const WhatsappNumberEntrySchema = SchemaFactory.createForClass(WhatsappNumberEntry);

@Schema({ _id: false })
class SocialLinks {
  @Prop({ type: String, default: null }) instagram!: string | null;
  @Prop({ type: String, default: null }) facebook!: string | null;
  @Prop({ type: String, default: null }) youtube!: string | null;
  @Prop({ type: String, default: null }) linkedin!: string | null;
  @Prop({ type: String, default: null }) whatsappChannel!: string | null;
}
const SocialLinksSchema = SchemaFactory.createForClass(SocialLinks);

@Schema({ _id: false })
class MarketingPixels {
  @Prop({ type: String, default: null }) googleAnalyticsId!: string | null;
  @Prop({ type: String, default: null }) googleTagManagerId!: string | null;
  @Prop({ type: String, default: null }) metaPixelId!: string | null;
  @Prop({ type: String, default: null }) googleAdsConversionId!: string | null;
}
const MarketingPixelsSchema = SchemaFactory.createForClass(MarketingPixels);

@Schema({ _id: false })
class SeoDefaults {
  @Prop({ type: String, default: null }) defaultTitle!: string | null;
  @Prop({ type: String, default: null }) defaultDescription!: string | null;
  @Prop({ type: String, default: null }) defaultOgImageUrl!: string | null;
}
const SeoDefaultsSchema = SchemaFactory.createForClass(SeoDefaults);

@Schema({ _id: false })
class BusinessHourEntry {
  @Prop({ required: true }) day!: string;
  @Prop({ type: String, default: null }) open!: string | null;
  @Prop({ type: String, default: null }) close!: string | null;
  @Prop({ default: false }) isClosed!: boolean;
}
const BusinessHourEntrySchema = SchemaFactory.createForClass(BusinessHourEntry);

@Schema({ _id: false })
class Address {
  @Prop({ type: String, default: null }) line1!: string | null;
  @Prop({ type: String, default: null }) line2!: string | null;
  @Prop({ type: String, default: null }) city!: string | null;
  @Prop({ type: String, default: null }) state!: string | null;
  @Prop({ type: String, default: null }) pincode!: string | null;
  @Prop({ type: String, default: null }) country!: string | null;
  @Prop({ type: String, default: null }) mapEmbedUrl!: string | null;
}
const AddressSchema = SchemaFactory.createForClass(Address);

export type SettingsDocument = HydratedDocument<Settings>;

@Schema({ timestamps: true, collection: 'settings' })
export class Settings extends Document {
  @Prop({ required: true, default: 'My Clinic' })
  businessName!: string;

  @Prop({ type: String, default: null })
  legalName!: string | null;

  @Prop({ type: String, default: null })
  logoUrl!: string | null;

  @Prop({ type: String, default: null })
  faviconUrl!: string | null;

  @Prop({ type: String, default: null })
  contactEmail!: string | null;

  @Prop({ type: String, default: null })
  contactPhone!: string | null;

  @Prop({ type: [WhatsappNumberEntrySchema], default: [] })
  whatsappNumbers!: WhatsappNumberEntry[];

  @Prop({ type: SocialLinksSchema, default: () => ({}) })
  socialLinks!: SocialLinks;

  @Prop({ type: MarketingPixelsSchema, default: () => ({}) })
  marketingPixels!: MarketingPixels;

  @Prop({ type: SeoDefaultsSchema, default: () => ({}) })
  seoDefaults!: SeoDefaults;

  @Prop({ type: [BusinessHourEntrySchema], default: [] })
  businessHours!: BusinessHourEntry[];

  @Prop({ type: AddressSchema, default: () => ({}) })
  address!: Address;

  @Prop({ default: false })
  maintenanceMode!: boolean;

  @Prop({ type: Types.ObjectId, ref: 'User', default: null })
  updatedBy!: Types.ObjectId | null;
}

export const SettingsSchema = SchemaFactory.createForClass(Settings);
