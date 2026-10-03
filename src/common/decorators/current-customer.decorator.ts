import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestCustomer } from '../../modules/customers/types/customer-jwt-payload.type';

export const CurrentCustomer = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestCustomer => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestCustomer;
});
