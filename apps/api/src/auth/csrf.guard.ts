import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_SECRET_LENGTH = 32;

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_SECRET_LENGTH).toString('hex');
}

export function signCsrfToken(token: string, secret: string): string {
  const hmac = crypto.createHmac('sha256', secret);
  hmac.update(token);
  return hmac.digest('hex');
}

@Injectable()
export class CsrfGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest<Request>();
    const method = request.method;

    if (method === 'GET' || method === 'HEAD' || method === 'OPTIONS') {
      return true;
    }

    const cookieToken = request.cookies?.[CSRF_TOKEN_COOKIE];
    const headerToken = request.headers[CSRF_TOKEN_HEADER] as string | undefined;

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new ForbiddenException('CSRF configuration error');
    }

    const expectedSignature = signCsrfToken(cookieToken, secret);

    if (!crypto.timingSafeEqual(Buffer.from(headerToken), Buffer.from(expectedSignature))) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }
}

export function setCsrfCookie(res: Response) {
  const token = generateCsrfToken();
  res.cookie(CSRF_TOKEN_COOKIE, token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return token;
}
