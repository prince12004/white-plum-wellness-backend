import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { Strategy } from 'passport-jwt';
import type { JwtAccessPayload, RequestUser } from '../types/jwt-payload.type';

function extractFromCookie(req: Request): string | null {
  return req?.cookies?.access_token ?? null;
}

@Injectable()
export class JwtAccessStrategy extends PassportStrategy(Strategy, 'jwt-access') {
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
      secretOrKey: config.get<string>('jwt.accessSecret') as string,
    });
  }

  validate(payload: JwtAccessPayload): RequestUser {
    return { ...payload, userId: payload.sub };
  }
}
