import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  return crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
}

@Injectable()
export class CsrfGuard implements CanActivate {
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

    if (!cookieToken || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    const cookieBuffer = Buffer.from(cookieToken, 'utf8');
    const headerBuffer = Buffer.from(headerToken, 'utf8');

    if (
      cookieBuffer.length !== headerBuffer.length ||
      !crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    ) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }
}

export function setCsrfCookie(res: Response): string {
  const raw = generateCsrfToken();
  res.cookie(CSRF_TOKEN_COOKIE, raw, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return raw;
}
