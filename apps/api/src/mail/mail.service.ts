import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider, SendMailOptions, SendMailResult } from './mail-provider.interface';
import { BrevoProvider } from './providers/brevo.provider';
import { CustomSmtpProvider } from './providers/custom-smtp.provider';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private providers: Map<string, MailProvider> = new Map();
  private defaultProvider: string;

  constructor(
    private config: ConfigService,
    private brevoProvider: BrevoProvider,
    private customSmtpProvider: CustomSmtpProvider,
  ) {
    this.providers.set('brevo', this.brevoProvider);
    this.providers.set('custom_smtp', this.customSmtpProvider);
    this.defaultProvider = this.config.get('DEFAULT_MAIL_PROVIDER', 'brevo');
  }

  async send(options: SendMailOptions, providerName?: string): Promise<SendMailResult> {
    const provider = this.providers.get(providerName || this.defaultProvider);
    if (!provider) {
      throw new Error(`Mail provider "${providerName}" not found`);
    }

    this.logger.log(`Sending email via ${provider.name} to ${options.to.join(', ')}`);
    const result = await provider.send(options);

    if (!result.success) {
      this.logger.error(`Email failed via ${provider.name}: ${result.error}`);
    } else {
      this.logger.log(`Email sent successfully via ${provider.name}: ${result.messageId}`);
    }

    return result;
  }

  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getDefaultProvider(): string {
    return this.defaultProvider;
  }
}
