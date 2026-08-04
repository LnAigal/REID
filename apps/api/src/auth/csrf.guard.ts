import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Request, Response } from 'express';
import * as crypto from 'crypto';

const CSRF_TOKEN_COOKIE = 'csrf_token';
const CSRF_TOKEN_HEADER = 'x-csrf-token';
const CSRF_SECRET_LENGTH = 32;

function getCsrfSecret(): Buffer {
  const secret = process.env.CSRF_SECRET;
  if (!secret || secret.length < 32) {
    throw new Error('CSRF_SECRET must be set and at least 32 characters');
  }
  return Buffer.from(secret);
}

function hmacSign(token: string, secret: Buffer): string {
  return crypto.createHmac('sha256', secret).update(token).digest('hex');
}

export function generateCsrfToken(): { raw: string; signature: string } {
  const raw = crypto.randomBytes(CSRF_SECRET_LENGTH).toString('hex');
  const signature = hmacSign(raw, getCsrfSecret());
  return { raw, signature };
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

    const cookieSignature = request.cookies?.[CSRF_TOKEN_COOKIE];
    const headerToken = request.headers[CSRF_TOKEN_HEADER] as string | undefined;

    if (!cookieSignature || !headerToken) {
      throw new ForbiddenException('CSRF token missing');
    }

    const secret = getCsrfSecret();
    const expectedSignature = hmacSign(headerToken, secret);

    const cookieBuffer = Buffer.from(cookieSignature, 'hex');
    const expectedBuffer = Buffer.from(expectedSignature, 'hex');

    if (
      cookieBuffer.length !== expectedBuffer.length ||
      !crypto.timingSafeEqual(cookieBuffer, expectedBuffer)
    ) {
      throw new ForbiddenException('CSRF token invalid');
    }

    return true;
  }
}

export function setCsrfCookie(res: Response): string {
  const { raw, signature } = generateCsrfToken();
  res.cookie(CSRF_TOKEN_COOKIE, signature, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return raw;
}
