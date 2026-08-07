import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

const CSRF_TOKEN_LENGTH = 32;

@Injectable()
export class CsrfService {
  private readonly secret: string;

  constructor(config: ConfigService) {
    this.secret = config.getOrThrow('CSRF_SECRET');
  }

  generateToken(): string {
    const token = crypto.randomBytes(CSRF_TOKEN_LENGTH).toString('hex');
    return `${token}.${this.sign(token)}`;
  }

  verify(cookieToken: string | undefined, headerToken: string | undefined): boolean {
    if (!cookieToken || !headerToken) return false;
    if (!this.hasValidSignature(cookieToken)) return false;

    const cookieBuffer = Buffer.from(cookieToken, 'utf8');
    const headerBuffer = Buffer.from(headerToken, 'utf8');
    return (
      cookieBuffer.length === headerBuffer.length &&
      crypto.timingSafeEqual(cookieBuffer, headerBuffer)
    );
  }

  private sign(token: string): string {
    return crypto.createHmac('sha256', this.secret).update(token).digest('hex');
  }

  private hasValidSignature(cookieToken: string): boolean {
    const dotIndex = cookieToken.lastIndexOf('.');
    if (dotIndex <= 0) return false;

    const token = cookieToken.slice(0, dotIndex);
    const signature = cookieToken.slice(dotIndex + 1);
    const expected = this.sign(token);
    const received = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');

    return (
      received.length === expectedBuffer.length &&
      crypto.timingSafeEqual(received, expectedBuffer)
    );
  }
}
