import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, HydratedDocument, Types } from 'mongoose';

export type FavouriteItemType = 'package' | 'offer';
export const FAVOURITE_ITEM_TYPES: FavouriteItemType[] = ['package', 'offer'];

export type FavouriteDocument = HydratedDocument<Favourite>;

@Schema({ timestamps: true })
export class Favourite extends Document {
  @Prop({ type: Types.ObjectId, ref: 'Customer', required: true, index: true })
  customerId!: Types.ObjectId;

  @Prop({ enum: FAVOURITE_ITEM_TYPES, required: true })
  itemType!: FavouriteItemType;

  @Prop({ required: true })
  itemSlug!: string;
}

export const FavouriteSchema = SchemaFactory.createForClass(Favourite);
FavouriteSchema.index({ customerId: 1, itemType: 1, itemSlug: 1 }, { unique: true });
