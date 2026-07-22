import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { SendMailOptions } from '../mail/mail-provider.interface';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(
    private prisma: PrismaService,
    private mailService: MailService,
  ) {}

  async send(userId: string, data: SendMailOptions, apiKeyId?: string) {
    const domain = this.extractDomain(data.from);
    const domainRecord = await this.prisma.domain.findFirst({
      where: { name: domain, userId, status: 'VERIFIED' },
    });

    if (!domainRecord) {
      throw new BadRequestException(`Domain "${domain}" is not verified`);
    }

    const email = await this.prisma.email.create({
      data: {
        from: data.from,
        to: data.to,
        cc: data.cc || [],
        bcc: data.bcc || [],
        replyTo: data.replyTo,
        subject: data.subject,
        html: data.html,
        text: data.text,
        headers: data.headers as any,
        status: 'QUEUED',
        provider: 'BREVO',
        apiKeyId,
        domainId: domainRecord.id,
        userId,
      },
    });

    this.prisma.email.update({
      where: { id: email.id },
      data: { status: 'PROCESSING' },
    }).catch(() => {});

    const result = await this.mailService.send(data);

    const updateData: any = {};
    if (result.success) {
      updateData.status = 'SENT';
      updateData.providerId = result.messageId;
      updateData.sentAt = new Date();
    } else {
      updateData.status = 'FAILED';
      updateData.errorMessage = result.error;
    }

    const updatedEmail = await this.prisma.email.update({
      where: { id: email.id },
      data: updateData,
    });

    await this.prisma.emailEvent.create({
      data: {
        type: result.success ? 'sent' : 'failed',
        data: result as any,
        emailId: email.id,
      },
    });

    if (!result.success) {
      throw new BadRequestException(result.error || 'Failed to send email');
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
    const where: any = { userId };

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
    return email.split('@')[1];
  }
}
