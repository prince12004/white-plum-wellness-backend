import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsGuard } from './permissions.guard';

function buildContext(user: unknown): ExecutionContext {
  return {
    switchToHttp: () => ({ getRequest: () => ({ user }) }),
    getHandler: () => ({}),
    getClass: () => ({}),
  } as unknown as ExecutionContext;
}

describe('PermissionsGuard', () => {
  it('allows the request when no permissions are required', () => {
    const reflector = { getAllAndOverride: () => undefined } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(buildContext({ roleKey: 'DOCTOR', permissions: [] }))).toBe(true);
  });

  it('always allows SUPER_ADMIN regardless of its permissions list', () => {
    const reflector = { getAllAndOverride: () => ['users:delete'] } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(guard.canActivate(buildContext({ roleKey: 'SUPER_ADMIN', permissions: [] }))).toBe(true);
  });

  it('throws ForbiddenException when the user is missing a required permission', () => {
    const reflector = { getAllAndOverride: () => ['users:delete'] } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(() =>
      guard.canActivate(buildContext({ roleKey: 'COUNSELLOR', permissions: ['leads:read'] })),
    ).toThrow(ForbiddenException);
  });

  it('allows the request when the user has every required permission', () => {
    const reflector = { getAllAndOverride: () => ['users:read', 'users:update'] } as unknown as Reflector;
    const guard = new PermissionsGuard(reflector);
    expect(
      guard.canActivate(buildContext({ roleKey: 'ADMIN', permissions: ['users:read', 'users:update'] })),
    ).toBe(true);
  });
});
