import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Applied explicitly per-controller/route (never registered globally like the
 * admin `JwtAuthGuard`) — customer-facing routes must also carry `@Public()` to
 * escape the global admin guard first, then this guard enforces the customer
 * session on top.
 */
@Injectable()
export class CustomerJwtAuthGuard extends AuthGuard('jwt-customer-access') {}
