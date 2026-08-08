import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { UnauthorizedException } from '@nestjs/common';
import { WebhookService } from './webhook.service';
import { PrismaService } from '../prisma/prisma.service';
import * as crypto from 'crypto';

describe('WebhookService', () => {
  let service: WebhookService;
  let prisma: {
    email: { findFirst: jest.Mock; update: jest.Mock };
    emailEvent: { create: jest.Mock };
    $transaction: jest.Mock;
  };
  let config: { get: jest.Mock };

  beforeEach(async () => {
    prisma = {
      email: { findFirst: jest.fn(), update: jest.fn() },
      emailEvent: { create: jest.fn() },
      $transaction: jest.fn((txs: unknown[]) => Promise.all(txs)),
    };
    config = { get: jest.fn().mockReturnValue(undefined) };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WebhookService,
        { provide: PrismaService, useValue: prisma },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();

    service = module.get<WebhookService>(WebhookService);
  });

  describe('handleEvent', () => {
    it('marks an email as delivered and records the event', async () => {
      prisma.email.findFirst.mockResolvedValue({ id: 'email1' });

      const result = await service.handleEvent('brevo', {
        event: 'delivered',
        'message-id': '<abc123@srv.example>',
      });

      expect(result).toEqual({ received: true, matched: true, event: 'delivered' });
      expect(prisma.email.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'DELIVERED', deliveredAt: expect.any(Date) }),
        }),
      );
      expect(prisma.emailEvent.create).toHaveBeenCalled();
    });

    it('matches a message id that only differs by angle brackets', async () => {
      prisma.email.findFirst.mockResolvedValue({ id: 'email1' });

      await service.handleEvent('brevo', { event: 'opened', 'message-id': 'abc123@srv.example' });

      expect(prisma.email.findFirst).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({
            OR: [
              { providerId: 'abc123@srv.example' },
              { providerId: 'abc123@srv.example' },
            ],
          }),
        }),
      );
    });

    it('maps bounces to BOUNCED', async () => {
      prisma.email.findFirst.mockResolvedValue({ id: 'email1' });

      await service.handleEvent('brevo', { event: 'hard_bounce', 'message-id': 'm1' });

      expect(prisma.email.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ status: 'BOUNCED', bouncedAt: expect.any(Date) }),
        }),
      );
    });

    it('returns unmatched when the message id is unknown', async () => {
      prisma.email.findFirst.mockResolvedValue(null);

      const result = await service.handleEvent('brevo', { event: 'delivered', 'message-id': 'nope' });

      expect(result).toEqual({ received: true, matched: false, event: 'delivered' });
      expect(prisma.email.update).not.toHaveBeenCalled();
    });
  });

  describe('verifySignature', () => {
    it('accepts a request when no secret is configured', () => {
      config.get.mockReturnValue(undefined);

      expect(() =>
        service.verifySignature({ headers: {} } as never, 'brevo'),
      ).not.toThrow();
    });

    it('rejects unsigned webhooks in production even without a configured secret', () => {
      const previousEnv = process.env.NODE_ENV;
      process.env.NODE_ENV = 'production';
      config.get.mockReturnValue(undefined);

      try {
        expect(() =>
          service.verifySignature({ headers: {} } as never, 'brevo'),
        ).toThrow(UnauthorizedException);
      } finally {
        process.env.NODE_ENV = previousEnv;
      }
    });

    it('rejects a request with a bad signature', () => {
      config.get.mockReturnValue('secret');
      const rawBody = Buffer.from('{"event":"delivered"}');

      expect(() =>
        service.verifySignature(
          {
            headers: { 'x-webhook-signature': 'wrong' },
            rawBody,
          } as never,
          'brevo',
        ),
      ).toThrow(UnauthorizedException);
    });

    it('accepts a request with a valid signature', () => {
      config.get.mockReturnValue('secret');
      const rawBody = Buffer.from('{"event":"delivered"}');
      const signature = crypto.createHmac('sha256', 'secret').update(rawBody).digest('hex');

      expect(() =>
        service.verifySignature(
          {
            headers: { 'x-webhook-signature': signature },
            rawBody,
          } as never,
          'brevo',
        ),
      ).not.toThrow();
    });
  });
});
