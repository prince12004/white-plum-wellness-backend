import { IsEnum, IsString } from 'class-validator';
import { FAVOURITE_ITEM_TYPES, FavouriteItemType } from '../schemas/favourite.schema';

export class CreateFavouriteDto {
  @IsEnum(FAVOURITE_ITEM_TYPES)
  itemType!: FavouriteItemType;

  @IsString()
  itemSlug!: string;
}
