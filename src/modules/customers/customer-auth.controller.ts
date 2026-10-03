import { Body, Controller, Get, HttpCode, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Throttle } from '@nestjs/throttler';
import { Request, Response } from 'express';
import { parseDurationToMs } from '../../common/utils/duration.util';
import { CurrentCustomer } from '../../common/decorators/current-customer.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { CustomerJwtAuthGuard } from '../../common/guards/customer-jwt-auth.guard';
import { CustomerJwtRefreshGuard } from '../../common/guards/customer-jwt-refresh.guard';
import { CustomerAuthService, CustomerAuthTokens } from './customer-auth.service';
import { CustomersService } from './customers.service';
import { RequestOtpDto } from './dto/request-otp.dto';
import { VerifyOtpDto } from './dto/verify-otp.dto';
import type { CustomerRefreshPayload, RequestCustomer } from './types/customer-jwt-payload.type';

@Controller('customer-auth')
export class CustomerAuthController {
  constructor(
    private readonly customerAuthService: CustomerAuthService,
    private readonly customersService: CustomersService,
    private readonly configService: ConfigService,
  ) {}

  private setAuthCookies(res: Response, tokens: CustomerAuthTokens) {
    const isProd = this.configService.get<string>('nodeEnv') === 'production';
    const domain = this.configService.get<string>('cookieDomain');

    res.cookie('customer_access_token', tokens.accessToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: parseDurationToMs(tokens.accessTtl),
    });
    res.cookie('customer_refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: isProd,
      sameSite: 'lax',
      domain,
      path: '/',
      maxAge: parseDurationToMs(tokens.refreshTtl),
    });
  }

  private clearAuthCookies(res: Response) {
    res.clearCookie('customer_access_token', { path: '/' });
    res.clearCookie('customer_refresh_token', { path: '/' });
  }

  @Public()
  @Throttle({ default: { limit: 5, ttl: 60_000 } })
  @Post('otp/request')
  @HttpCode(200)
  async requestOtp(@Body() dto: RequestOtpDto) {
    await this.customerAuthService.requestOtp(dto.phone);
    return { success: true };
  }

  @Public()
  @Throttle({ default: { limit: 8, ttl: 60_000 } })
  @Post('otp/verify')
  @HttpCode(200)
  async verifyOtp(@Body() dto: VerifyOtpDto, @Res({ passthrough: true }) res: Response) {
    const { customer, tokens } = await this.customerAuthService.verifyOtpAndLogin(dto.phone, dto.code);
    this.setAuthCookies(res, tokens);
    await this.customersService.recordLogin(String(customer._id));

    return {
      customer: { id: String(customer._id), phone: customer.phone, name: customer.name },
      accessToken: tokens.accessToken,
    };
  }

  @Public()
  @UseGuards(CustomerJwtRefreshGuard)
  @Post('refresh')
  @HttpCode(200)
  async refresh(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const payload = req.user as CustomerRefreshPayload;
    const presentedToken = req.cookies?.customer_refresh_token as string;
    const tokens = await this.customerAuthService.refresh(payload, presentedToken);
    this.setAuthCookies(res, tokens);
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Post('logout')
  @HttpCode(200)
  async logout(@CurrentCustomer() customer: RequestCustomer, @Res({ passthrough: true }) res: Response) {
    await this.customerAuthService.logout(customer.customerId);
    this.clearAuthCookies(res);
    return { success: true };
  }

  @Public()
  @UseGuards(CustomerJwtAuthGuard)
  @Get('me')
  async me(@CurrentCustomer() customer: RequestCustomer) {
    return this.customersService.findById(customer.customerId);
  }
}
