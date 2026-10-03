import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { randomUUID } from 'crypto';
import { hashValue, verifyHash } from '../../common/utils/hash.util';
import { normalizePhone } from '../../common/utils/phone.util';
import { OTP_PROVIDER, type OtpProvider } from '../otp/otp-provider.interface';
import { CustomersService } from './customers.service';
import type { CustomerDocument } from './schemas/customer.schema';
import type { CustomerAccessPayload, CustomerRefreshPayload } from './types/customer-jwt-payload.type';

export interface CustomerAuthTokens {
  accessToken: string;
  refreshToken: string;
  accessTtl: string;
  refreshTtl: string;
}

@Injectable()
export class CustomerAuthService {
  constructor(
    @Inject(OTP_PROVIDER) private readonly otpProvider: OtpProvider,
    private readonly customersService: CustomersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async requestOtp(rawPhone: string): Promise<void> {
    await this.otpProvider.requestOtp(normalizePhone(rawPhone));
  }

  async verifyOtpAndLogin(rawPhone: string, code: string): Promise<{ customer: CustomerDocument; tokens: CustomerAuthTokens }> {
    const phone = normalizePhone(rawPhone);
    const valid = await this.otpProvider.verifyOtp(phone, code);
    if (!valid) throw new UnauthorizedException('Invalid or expired code');

    const customer = await this.customersService.findOrCreateByPhone(phone);
    if (customer.status === 'BLOCKED') throw new UnauthorizedException('This account has been blocked');

    const tokens = await this.issueTokens(customer);
    return { customer, tokens };
  }

  async issueTokens(customer: CustomerDocument): Promise<CustomerAuthTokens> {
    const accessPayload: CustomerAccessPayload = { sub: String(customer._id), phone: customer.phone };
    const accessTtl = this.configService.get<string>('customerJwt.accessTtl') as string;
    const refreshTtl = this.configService.get<string>('customerJwt.refreshTtl') as string;

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get<string>('customerJwt.accessSecret'),
      expiresIn: accessTtl,
    });

    const tokenVersion = randomUUID();
    const refreshPayload: CustomerRefreshPayload = { sub: String(customer._id), tokenVersion };
    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get<string>('customerJwt.refreshSecret'),
      expiresIn: refreshTtl,
    });

    await this.customersService.setRefreshTokenHash(String(customer._id), await hashValue(refreshToken));

    return { accessToken, refreshToken, accessTtl, refreshTtl };
  }

  async refresh(payload: CustomerRefreshPayload, presentedToken: string): Promise<CustomerAuthTokens> {
    const customer = await this.customersService.findByIdWithRefreshHash(payload.sub);
    if (!customer || !customer.refreshTokenHash) throw new UnauthorizedException('Session expired, please log in again');

    const matches = await verifyHash(customer.refreshTokenHash, presentedToken);
    if (!matches) {
      await this.customersService.setRefreshTokenHash(String(customer._id), null);
      throw new UnauthorizedException('Session expired, please log in again');
    }

    return this.issueTokens(customer);
  }

  async logout(customerId: string) {
    await this.customersService.setRefreshTokenHash(customerId, null);
  }
}
