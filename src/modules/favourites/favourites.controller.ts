import { Body, Controller, Delete, Get, Param, Post, UseGuards } from '@nestjs/common';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import type { RequestCustomer } from '../customers/types/customer-jwt-payload.type';
import { CreateFavouriteDto } from './dto/create-favourite.dto';
import { FavouritesService } from './favourites.service';
import type { FavouriteItemType } from './schemas/favourite.schema';

@Controller('favourites')
export class FavouritesController {
  constructor(private readonly favouritesService: FavouritesService) {}

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('mine')
  findMine(@CurrentCustomer() customer: RequestCustomer) {
    return this.favouritesService.findMine(customer.customerId);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post()
  add(@CurrentCustomer() customer: RequestCustomer, @Body() dto: CreateFavouriteDto) {
    return this.favouritesService.add(customer.customerId, dto.itemType, dto.itemSlug);
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Delete(':itemType/:itemSlug')
  remove(
    @CurrentCustomer() customer: RequestCustomer,
    @Param('itemType') itemType: FavouriteItemType,
    @Param('itemSlug') itemSlug: string,
  ) {
    return this.favouritesService.remove(customer.customerId, itemType, itemSlug);
  }

  /** Admin-facing: view one customer's saved items (their own admin session, not the customer's). */
  @Get('customer/:customerId')
  @RequirePermissions('customers:read')
  findByCustomer(@Param('customerId') customerId: string) {
    return this.favouritesService.findByCustomerId(customerId);
  }
}
