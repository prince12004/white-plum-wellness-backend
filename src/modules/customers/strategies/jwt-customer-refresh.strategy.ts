import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { CustomerRefreshPayload } from '../types/customer-jwt-payload.type';

@Injectable()
export class JwtCustomerRefreshStrategy extends PassportStrategy(Strategy, 'jwt-customer-refresh') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => req?.cookies?.customer_refresh_token ?? null,
      ignoreExpiration: false,
      passReqToCallback: false,
      secretOrKey: config.get<string>('customerJwt.refreshSecret') as string,
    });
  }

  validate(payload: CustomerRefreshPayload): CustomerRefreshPayload {
    return payload;
  }
}
