import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { RequestUser } from '../../modules/auth/types/jwt-payload.type';

export const CurrentUser = createParamDecorator((_: unknown, ctx: ExecutionContext): RequestUser => {
  const request = ctx.switchToHttp().getRequest();
  return request.user as RequestUser;
});
