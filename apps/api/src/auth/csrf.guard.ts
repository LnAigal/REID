import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { CsrfService } from './csrf.service';
import { cookieDomain } from './cookie.utils';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';

@Injectable()
export class CsrfGuard implements CanActivate {
  constructor(
    private csrfService: CsrfService,
    private config: ConfigService,
  ) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    const authHeader = request.headers.authorization;
    if (authHeader?.startsWith('Bearer reid_')) {
      return true;
    }

    const cookieToken = request.cookies?.[CSRF_TOKEN_COOKIE];
    const headerToken = request.headers[CSRF_TOKEN_HEADER] as string | undefined;

    if (!this.csrfService.verify(cookieToken, headerToken)) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }
}

export function setCsrfCookie(res: Response, raw: string, config: ConfigService): void {
  const domain = cookieDomain();
  const isProduction = config.get('NODE_ENV') === 'production';
  res.cookie(CSRF_TOKEN_COOKIE, raw, {
    httpOnly: false,
    secure: isProduction,
    sameSite: 'strict',
    path: '/',
    maxAge: 7 * 24 * 60 * 60 * 1000,
    ...(domain ? { domain } : {}),
  });
}
