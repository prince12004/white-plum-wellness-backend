import { AppThrottlerGuard } from './app-throttler.guard';

function contextFor(remoteAddress: string, headers: Record<string, string> = {}) {
  return {
    switchToHttp: () => ({ getRequest: () => ({ socket: { remoteAddress }, headers }) }),
    getHandler: () => undefined,
    getClass: () => undefined,
  } as never;
}

describe('AppThrottlerGuard', () => {
  const guard = Object.create(AppThrottlerGuard.prototype) as AppThrottlerGuard & {
    shouldSkip(context: unknown): Promise<boolean>;
  };

  it('skips direct calls from the website server on this machine', async () => {
    await expect(guard.shouldSkip(contextFor('127.0.0.1'))).resolves.toBe(true);
    await expect(guard.shouldSkip(contextFor('::ffff:127.0.0.1'))).resolves.toBe(true);
  });

  it('still limits visitors proxied through nginx', async () => {
    await expect(guard.shouldSkip(contextFor('127.0.0.1', { 'x-forwarded-for': '203.0.113.9' }))).resolves.toBe(false);
  });

  it('still limits outside callers', async () => {
    await expect(guard.shouldSkip(contextFor('203.0.113.9'))).resolves.toBe(false);
  });
});
