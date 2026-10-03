import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Favourite, FavouriteDocument, FavouriteItemType } from './schemas/favourite.schema';

@Injectable()
export class FavouritesService {
  constructor(@InjectModel(Favourite.name) private readonly favouriteModel: Model<FavouriteDocument>) {}

  async add(customerId: string, itemType: FavouriteItemType, itemSlug: string) {
    return this.favouriteModel.findOneAndUpdate(
      { customerId: new Types.ObjectId(customerId), itemType, itemSlug },
      { customerId: new Types.ObjectId(customerId), itemType, itemSlug },
      { upsert: true, new: true },
    );
  }

  async remove(customerId: string, itemType: FavouriteItemType, itemSlug: string) {
    await this.favouriteModel.deleteOne({ customerId: new Types.ObjectId(customerId), itemType, itemSlug });
    return { success: true };
  }

  async findMine(customerId: string) {
    return this.favouriteModel.find({ customerId: new Types.ObjectId(customerId) }).sort({ createdAt: -1 }).lean();
  }

  async findByCustomerId(customerId: string) {
    return this.findMine(customerId);
  }
}
