import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { CustomerAccessPayload, RequestCustomer } from '../types/customer-jwt-payload.type';

function extractFromCookie(req: Request): string | null {
  return req?.cookies?.customer_access_token ?? null;
}

@Injectable()
export class JwtCustomerAccessStrategy extends PassportStrategy(Strategy, 'jwt-customer-access') {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: (req: Request) => {
        const fromCookie = extractFromCookie(req);
        if (fromCookie) return fromCookie;
        const authHeader = req.headers.authorization;
        if (authHeader?.startsWith('Bearer ')) return authHeader.slice(7);
        return null;
      },
      ignoreExpiration: false,
      secretOrKey: config.get<string>('customerJwt.accessSecret') as string,
    });
  }

  validate(payload: CustomerAccessPayload): RequestCustomer {
    return { ...payload, customerId: payload.sub };
  }
}
