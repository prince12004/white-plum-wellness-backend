import { Body, Controller, Delete, Get, Param, Patch, Post, Query, Req, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { RequirePermissions } from '../../common/decorators/permissions.decorator';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import type { RequestUser } from '../auth/types/jwt-payload.type';
import { AuditLogService } from '../audit-log/audit-log.service';
import { CustomersService } from '../customers/customers.service';
import type { CustomerAccessPayload, RequestCustomer } from '../customers/types/customer-jwt-payload.type';
import { BookingsService } from './bookings.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { ListBookingsQueryDto } from './dto/list-bookings-query.dto';
import { UpdateBookingStatusDto } from './dto/update-booking-status.dto';

@Controller('bookings')
export class BookingsController {
  constructor(
    private readonly bookingsService: BookingsService,
    private readonly auditLogService: AuditLogService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly customersService: CustomersService,
  ) {}

  /**
   * Best-effort attribution: if a valid customer session cookie is present, this
   * anonymous-by-default endpoint still links the booking to that customer, without
   * requiring the public site to change how it calls this route when logged in.
   */
  private tryGetCustomerId(req: Request): string | null {
    const token = req.cookies?.customer_access_token;
    if (!token) return null;
    try {
      const payload = this.jwtService.verify<CustomerAccessPayload>(token, {
        secret: this.configService.get<string>('customerJwt.accessSecret'),
      });
      return payload.sub;
    } catch {
      return null;
    }
  }

  @Public()
  @Post()
  async create(@Body() dto: CreateBookingDto, @Req() req: Request) {
    const customerId = this.tryGetCustomerId(req);

    // Best-effort backfill: a WhatsApp-click lead from a logged-in customer carries
    // no form-entered name/phone, but we already know both from their account.
    let payload = dto;
    if (customerId && (!dto.name || !dto.phone)) {
      try {
        const customer = await this.customersService.findById(customerId);
        payload = {
          ...dto,
          name: dto.name ?? customer.name ?? undefined,
          phone: dto.phone ?? customer.phone,
        };
      } catch {
        // customer lookup failed — fall through with whatever the client sent
      }
    }

    const booking = await this.bookingsService.create(payload, customerId);
    return booking;
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('mine')
  findMine(@CurrentCustomer() customer: RequestCustomer) {
    return this.bookingsService.findMine(customer.customerId);
  }

  @Get()
  @RequirePermissions('appointments:read')
  findAll(@Query() query: ListBookingsQueryDto) {
    return this.bookingsService.findAll(query);
  }

  @Patch(':id/status')
  @RequirePermissions('appointments:update')
  async updateStatus(
    @Param('id') id: string,
    @Body() dto: UpdateBookingStatusDto,
    @CurrentUser() user: RequestUser,
    @Req() req: Request,
  ) {
    const { booking, before } = await this.bookingsService.updateStatus(id, dto.status);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'STATUS_CHANGE',
      module: 'appointments',
      entityId: id,
      entityLabel: booking.name,
      before: { status: before.status },
      after: { status: booking.status },
      req,
    });
    return booking;
  }

  @Delete(':id')
  @RequirePermissions('appointments:delete')
  async remove(@Param('id') id: string, @CurrentUser() user: RequestUser, @Req() req: Request) {
    const { before } = await this.bookingsService.remove(id);
    await this.auditLogService.record({
      actorId: user.userId,
      actorEmail: user.email,
      action: 'DELETE',
      module: 'appointments',
      entityId: id,
      entityLabel: before.name ?? undefined,
      before: { name: before.name, phone: before.phone, status: before.status },
      req,
    });
    return { success: true };
  }
}
