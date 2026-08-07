import { CsrfGuard, setCsrfCookie } from './csrf.guard';
import { CsrfService } from './csrf.service';
import { ForbiddenException } from '@nestjs/common';
import { ExecutionContext } from '@nestjs/common';

function makeCsrfService(secret = 'test-csrf-secret-that-is-at-least-32-chars-long') {
  const config = { getOrThrow: jest.fn().mockReturnValue(secret) } as never;
  return new CsrfService(config);
}

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
    return { guard: new CsrfGuard(makeCsrfService()), context };
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
    const csrfService = makeCsrfService();
    const token = csrfService.generateToken();
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: token },
      { 'x-csrf-token': csrfService.generateToken() },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('throws when the cookie token has a forged signature', () => {
    const csrfService = makeCsrfService();
    const token = csrfService.generateToken();
    const forged = token.replace(/.$/, token.endsWith('0') ? '1' : '0');
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: forged },
      { 'x-csrf-token': forged },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });

  it('allows mutations when the header token matches the signed cookie token', () => {
    const csrfService = makeCsrfService();
    const token = csrfService.generateToken();
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: token },
      { 'x-csrf-token': token },
    );
    expect(guard.canActivate(context)).toBe(true);
  });

  it('rejects a cookie from a different secret even with a matching header', () => {
    const token = makeCsrfService('secret-a-that-is-longer-than-32-chars!!').generateToken();
    const { guard, context } = makeContext(
      'POST',
      { csrf_token: token },
      { 'x-csrf-token': token },
    );
    expect(() => guard.canActivate(context)).toThrow(ForbiddenException);
  });
});

describe('setCsrfCookie', () => {
  it('sets the csrf_token cookie to the provided value', () => {
    const cookie = jest.fn();
    const res = { cookie } as never;
    setCsrfCookie(res, 'token.signature');
    expect(cookie).toHaveBeenCalledWith(
      'csrf_token',
      'token.signature',
      expect.objectContaining({ httpOnly: false, sameSite: 'strict' }),
    );
  });
});
