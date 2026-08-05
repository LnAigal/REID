import { CsrfGuard, generateCsrfToken } from './csrf.guard';
import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

describe('CsrfGuard', () => {
  const makeContext = (
    method: string,
    cookies: Record<string, unknown>,
    headers: Record<string, unknown>,
  ): { guard: CsrfGuard; context: ExecutionContext } => {
    const request = { method, cookies, headers };
    const context = {
      switchToHttp: () => ({ getRequest: () => request }),
    } as unknown as ExecutionContext;
    return { guard: new CsrfGuard(), context };
  };

  it('allows safe methods without a token', () => {
    for (const method of ['GET', 'HEAD', 'OPTIONS']) {
      const { guard, context } = makeContext(method, {}, {});
      expect(guard.canActivate(context)).toBe(true);
    }
  });

  it('skips CSRF checks for API key bearer tokens', () => {
    const { guard, context } = makeContext(
      'POST',
      {},
      { authorization: 'Bearer reid_live_abcdef' },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('throws when the token is missing', () => {
    const { guard, context } = makeContext('POST', {}, {});
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws when the header token differs from the cookie token', () => {
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: 'token-a' },
      { 'x-csrf-token': 'token-b' },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows mutations when the header token matches the cookie token', () => {
    const token = generateCsrfToken();
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: token },
      { 'x-csrf-token': token },
    );
    expect(guard.canActivate(context)).toBe(true);
  });
});
