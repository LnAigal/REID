import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getOverview(userId: string) {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const [
      totalEmails,
      sentEmails,
      deliveredEmails,
      failedEmails,
      bouncedEmails,
      totalDomains,
      totalApiKeys,
      recentEmails,
    ] = await Promise.all([
      this.prisma.email.count({ where: { userId, createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'SENT', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'DELIVERED', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'FAILED', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.email.count({ where: { userId, status: 'BOUNCED', createdAt: { gte: thirtyDaysAgo } } }),
      this.prisma.domain.count({ where: { userId } }),
      this.prisma.apiKey.count({ where: { userId, isActive: true } }),
      this.prisma.email.findMany({
        where: { userId, createdAt: { gte: sevenDaysAgo } },
        orderBy: { createdAt: 'desc' },
        take: 10,
        select: {
          id: true,
          subject: true,
          status: true,
          from: true,
          to: true,
          createdAt: true,
        },
      }),
    ]);

    const successRate = totalEmails > 0 ? ((sentEmails + deliveredEmails) / totalEmails) * 100 : 0;
    const failureRate = totalEmails > 0 ? (failedEmails / totalEmails) * 100 : 0;
    const bounceRate = totalEmails > 0 ? (bouncedEmails / totalEmails) * 100 : 0;

    return {
      emailsSent: totalEmails,
      successRate: Math.round(successRate * 100) / 100,
      failureRate: Math.round(failureRate * 100) / 100,
      bounceRate: Math.round(bounceRate * 100) / 100,
      totalDomains,
      totalApiKeys,
      recentActivity: recentEmails.map(e => ({
        id: e.id,
        type: e.status.toLowerCase(),
        description: `Email "${e.subject}" to ${e.to.join(', ')}`,
        timestamp: e.createdAt.toISOString(),
      })),
    };
  }

  async getChartData(userId: string, days = 30) {
    const now = new Date();
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    const emails = await this.prisma.email.findMany({
      where: { userId, createdAt: { gte: startDate } },
      select: { status: true, createdAt: true },
    });

    const chartData: Record<string, { date: string; sent: number; delivered: number; failed: number; bounced: number }> = {};

    for (let i = 0; i < days; i++) {
      const date = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000);
      const key = date.toISOString().split('T')[0];
      chartData[key] = { date: key, sent: 0, delivered: 0, failed: 0, bounced: 0 };
    }

    emails.forEach(email => {
      const key = email.createdAt.toISOString().split('T')[0];
      if (chartData[key]) {
        switch (email.status) {
          case 'SENT':
          case 'DELIVERED':
            chartData[key].sent++;
            if (email.status === 'DELIVERED') chartData[key].delivered++;
            break;
          case 'FAILED':
            chartData[key].failed++;
            break;
          case 'BOUNCED':
            chartData[key].bounced++;
            break;
        }
      }
    });

    return Object.values(chartData);
  }
}
