import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Favourite, FavouriteSchema } from './schemas/favourite.schema';
import { FavouritesController } from './favourites.controller';
import { FavouritesService } from './favourites.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: Favourite.name, schema: FavouriteSchema }])],
  controllers: [FavouritesController],
  providers: [FavouritesService],
  exports: [FavouritesService],
})
export class FavouritesModule {}
