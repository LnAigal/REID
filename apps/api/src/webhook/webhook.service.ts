import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { Request } from 'express';
import { Prisma, EmailStatus } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';

const EVENT_STATUS_MAP: Record<string, EmailStatus> = {
  delivered: 'DELIVERED',
  opened: 'OPENED',
  clicked: 'CLICKED',
  hard_bounce: 'BOUNCED',
  soft_bounce: 'BOUNCED',
  blocked: 'FAILED',
  invalid: 'FAILED',
  spam: 'FAILED',
  unsubscribe: 'FAILED',
};

const STATUS_TIMESTAMP_FIELD: Record<string, keyof Pick<Prisma.EmailUncheckedUpdateInput, 'deliveredAt' | 'openedAt' | 'clickedAt' | 'bouncedAt'>> = {
  delivered: 'deliveredAt',
  opened: 'openedAt',
  clicked: 'clickedAt',
  hard_bounce: 'bouncedAt',
  soft_bounce: 'bouncedAt',
  blocked: 'bouncedAt',
  invalid: 'bouncedAt',
};

@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
  ) {}

  verifySignature(req: Request, provider: string): void {
    const secret = this.config.get('WEBHOOK_SECRET');
    if (!secret) {
      this.logger.warn(`WEBHOOK_SECRET not set; accepting unsigned ${provider} webhook`);
      return;
    }

    const signature = req.headers['x-webhook-signature'] as string | undefined;
    const rawBody = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!signature || !rawBody) {
      throw new UnauthorizedException('Missing webhook signature');
    }

    const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
    const received = Buffer.from(signature, 'utf8');
    const expectedBuffer = Buffer.from(expected, 'utf8');
    if (
      received.length !== expectedBuffer.length ||
      !timingSafeEqual(received, expectedBuffer)
    ) {
      throw new UnauthorizedException('Invalid webhook signature');
    }
  }

  async handleEvent(provider: string, payload: unknown): Promise<{ received: boolean; matched: boolean; event?: string }> {
    const body = (payload ?? {}) as Record<string, unknown>;
    const event = typeof body.event === 'string' ? body.event.toLowerCase() : undefined;
    const messageId = this.extractMessageId(body);

    if (!event || !messageId) {
      this.logger.warn(`Webhook from ${provider} ignored: missing event or message id`);
      return { received: true, matched: false };
    }

    const email = await this.findEmailByProviderId(messageId);
    if (!email) {
      this.logger.warn(`Webhook from ${provider} for unknown message id ${messageId}`);
      return { received: true, matched: false, event };
    }

    const status = EVENT_STATUS_MAP[event];
    if (!status) {
      this.logger.warn(`Webhook from ${provider} for unknown event type "${event}"`);
      return { received: true, matched: false, event };
    }

    const updateData: Prisma.EmailUpdateInput = { status };
    const timestampField = STATUS_TIMESTAMP_FIELD[event];
    if (timestampField) {
      updateData[timestampField] = new Date();
    }

    await this.prisma.$transaction([
      this.prisma.email.update({ where: { id: email.id }, data: updateData }),
      this.prisma.emailEvent.create({
        data: {
          type: event,
          data: payload as Prisma.InputJsonValue,
          emailId: email.id,
        },
      }),
    ]);

    this.logger.log(`Webhook from ${provider}: email ${email.id} -> ${status}`);
    return { received: true, matched: true, event };
  }

  private extractMessageId(body: Record<string, unknown>): string | undefined {
    const id = body['message-id'] ?? body.messageId ?? body.message_id ?? body.id;
    return typeof id === 'string' ? id : undefined;
  }

  private async findEmailByProviderId(messageId: string) {
    const normalized = messageId.replace(/[<>]/g, '');
    return this.prisma.email.findFirst({
      where: {
        OR: [
          { providerId: messageId },
          { providerId: normalized },
        ],
      },
    });
  }
}
