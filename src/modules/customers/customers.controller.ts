import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import { CustomersService } from './customers.service';
import { ListCustomersQueryDto } from './dto/list-customers-query.dto';
import { UpdateCustomerProfileDto } from './dto/update-customer-profile.dto';
import type { RequestCustomer } from './types/customer-jwt-payload.type';

@Controller('customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  // --- Customer-facing (their own profile) ---

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Patch('me')
  updateMe(@CurrentCustomer() customer: RequestCustomer, @Body() dto: UpdateCustomerProfileDto) {
    return this.customersService.updateProfile(customer.customerId, dto);
  }

  // --- Admin-facing (read-only — customers self-register via OTP, admin never creates one) ---

  @Get()
  @RequirePermissions('customers:read')
  findAll(@Query() query: ListCustomersQueryDto) {
    return this.customersService.findAll(query);
  }

  @Get(':id')
  @RequirePermissions('customers:read')
  findOne(@Param('id') id: string) {
    return this.customersService.findById(id);
  }
}
