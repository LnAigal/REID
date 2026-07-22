import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { EmailModule } from './email/email.module';
import { DomainModule } from './domain/domain.module';
import { ApiKeyModule } from './api-key/api-key.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { TemplateModule } from './template/template.module';
import { MailModule } from './mail/mail.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ThrottlerModule.forRoot([{
      ttl: 60000,
      limit: 100,
    }]),
    PrismaModule,
    AuthModule,
    EmailModule,
    DomainModule,
    ApiKeyModule,
    AnalyticsModule,
    TemplateModule,
    MailModule,
  ],
})
export class AppModule {}
