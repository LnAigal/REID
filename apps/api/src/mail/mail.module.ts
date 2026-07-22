import { Module, Global } from '@nestjs/common';
import { MailService } from './mail.service';
import { BrevoProvider } from './providers/brevo.provider';
import { CustomSmtpProvider } from './providers/custom-smtp.provider';

@Global()
@Module({
  providers: [MailService, BrevoProvider, CustomSmtpProvider],
  exports: [MailService],
})
export class MailModule {}
