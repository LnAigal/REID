import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { createHash } from 'crypto';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CsrfModule } from './auth/csrf.module';
import { EmailModule } from './email/email.module';
import { DomainModule } from './domain/domain.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TemplateModule } from './template/template.module';
import { MailModule } from './mail/mail.module';
import { WebhookModule } from './webhook/webhook.module';
import { validate } from './config/env.validation';

const trackByApiKeyOrIp = (req: Record<string, any>): string => {
  const authHeader = req.headers?.authorization as string | undefined;
  if (authHeader?.startsWith('Bearer reid_')) {
    return `apikey:${createHash('sha256').update(authHeader).digest('hex')}`;
  }
  return `ip:${req.ip ?? req.socket?.remoteAddress ?? 'unknown'}`;
};

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
      getTracker: trackByApiKeyOrIp,
    }]),
    PrismaModule,
    CsrfModule,
    AuthModule,
    EmailModule,
    DomainModule,
    ApiKeyModule,
    AnalyticsModule,
    TemplateModule,
    MailModule,
    WebhookModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
