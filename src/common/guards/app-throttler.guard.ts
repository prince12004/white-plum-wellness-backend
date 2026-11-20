import { ExecutionContext, Injectable } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';
import { Request } from 'express';

const LOOPBACK = new Set(['127.0.0.1', '::1', '::ffff:127.0.0.1']);

/**
 * The website renders pages by calling this API directly on 127.0.0.1, once per
 * visitor and page. Counting those as one client hit the limit under ordinary
 * traffic and turned pages into 500s, so direct local calls are skipped. Browser
 * requests reach the API through nginx with X-Forwarded-For, so they are still
 * limited, per real visitor ('trust proxy' in main.ts).
 */
@Injectable()
export class AppThrottlerGuard extends ThrottlerGuard {
  protected async shouldSkip(context: ExecutionContext): Promise<boolean> {
    const req = context.switchToHttp().getRequest<Request>();
    const direct = LOOPBACK.has(req.socket?.remoteAddress ?? '') && !req.headers['x-forwarded-for'];
    return direct || super.shouldSkip(context);
  }
}
