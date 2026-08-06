import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { Prisma, EmailProvider } from '@repo/database';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SendMailOptions } from '../mail/mail-provider.interface';
import { sanitizeOptionalHtml } from '../utils/sanitize';

const PROVIDER_ENUM: Record<string, EmailProvider> = {
  brevo: 'BREVO',
  custom_smtp: 'CUSTOM_SMTP',
};

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async send(userId: string, data: SendMailOptions, apiKeyId?: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { emailVerified: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.emailVerified) {
      throw new BadRequestException('Email not verified. Please verify your email before sending.');
    }

    const domain = this.extractDomain(data.from);
    const domainRecord = await this.prisma.domain.findFirst({
      where: { name: { equals: domain, mode: 'insensitive' }, userId, status: 'VERIFIED' },
    });

    if (!domainRecord) {
      throw new BadRequestException(`Domain "${domain}" is not verified`);
    }

    const sanitizedHtml = sanitizeOptionalHtml(data.html);

    const email = await this.prisma.email.create({
      data: {
        from: data.from,
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        replyTo: data.replyTo,
        subject: data.subject,
        html: sanitizedHtml,
        text: data.text,
        headers: data.headers as Prisma.InputJsonValue,
        status: 'QUEUED',
        provider: PROVIDER_ENUM[this.mailService.getDefaultProvider()] || 'BREVO',
        apiKeyId,
        domainId: domainRecord.id,
        userId,
      },
    });

    await this.prisma.email.update({
      where: { id: email.id },
      data: { status: 'PROCESSING' },
    });

    let result: { success: boolean; messageId?: string; provider: string; error?: string };
    try {
      result = await this.mailService.send({ ...data, html: sanitizedHtml ?? undefined });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Mail provider failed';
      this.logger.error(`Email send threw for ${email.id}: ${errorMessage}`);
      await this.prisma.email.update({
        where: { id: email.id },
        data: { status: 'FAILED', errorMessage },
      });
      throw new BadRequestException('Failed to send email');
    }

    const updateData: Prisma.EmailUpdateInput = {};
    if (result.success) {
      updateData.status = 'SENT';
      updateData.providerId = result.messageId;
      updateData.sentAt = new Date();
    } else {
      updateData.status = 'FAILED';
      updateData.errorMessage = result.error ?? null;
    }

    const [updatedEmail] = await this.prisma.$transaction([
      this.prisma.email.update({
        where: { id: email.id },
        data: updateData,
      }),
      this.prisma.emailEvent.create({
        data: {
          type: result.success ? 'sent' : 'failed',
          data: result as unknown as Prisma.InputJsonValue,
          emailId: email.id,
        },
      }),
    ]);

    if (!result.success) {
      this.logger.error(`Email send failed for ${email.id}: ${result.error}`);
      throw new BadRequestException('Failed to send email');
    }

    return {
      id: updatedEmail.id,
      from: updatedEmail.from,
      to: updatedEmail.to,
      subject: updatedEmail.subject,
      status: updatedEmail.status,
      createdAt: updatedEmail.createdAt,
    };
  }

  async getEmails(userId: string, page = 1, limit = 20, search?: string) {
    const skip = (page - 1) * limit;
    const where: Prisma.EmailWhereInput = { userId };

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { from: { contains: search, mode: 'insensitive' } },
        { to: { has: search } },
      ];
    }

    const [emails, total] = await Promise.all([
      this.prisma.email.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          from: true,
          to: true,
          cc: true,
          bcc: true,
          subject: true,
          status: true,
          provider: true,
          latency: true,
          errorMessage: true,
          sentAt: true,
          deliveredAt: true,
          createdAt: true,
        },
      }),
      this.prisma.email.count({ where }),
    ]);

    return {
      data: emails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async getEmailById(userId: string, emailId: string) {
    const email = await this.prisma.email.findFirst({
      where: { id: emailId, userId },
      include: { events: { orderBy: { createdAt: 'desc' } } },
    });

    if (!email) throw new NotFoundException('Email not found');
    return email;
  }

  async getEmailStats(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [total, sent, delivered, failed, bounced] = await Promise.all([
      this.prisma.email.count({ where: { userId, createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'SENT', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'DELIVERED', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'FAILED', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'BOUNCED', createdAt: { gte: thirtyDaysAgo } } }),
    ]);

    return {
      total,
      sent,
      delivered,
      failed,
      bounced,
      successRate: total > 0 ? ((sent + delivered) / total) * 100 : 0,
      failureRate: total > 0 ? (failed / total) * 100 : 0,
      bounceRate: total > 0 ? (bounced / total) * 100 : 0,
    };
  }

  private extractDomain(email: string): string {
    const atIndex = email.indexOf('@');
    if (atIndex <= 0 || atIndex === email.length - 1) {
      throw new BadRequestException('Invalid email address: missing domain');
    }
    return email.substring(atIndex + 1);
  }
}
