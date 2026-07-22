import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider, SendMailOptions, SendMailResult } from '../mail-provider.interface';

@Injectable()
export class BrevoProvider implements MailProvider {
  name = 'brevo';
  private readonly logger = new Logger(BrevoProvider.name);
  private apiKey: string;

  constructor(private config: ConfigService) {
    this.apiKey = this.config.get('BREVO_API_KEY', '');
  }

  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const payload = {
        sender: { email: options.from },
        to: options.to.map(email => ({ email })),
        cc: options.cc?.map(email => ({ email })),
        bcc: options.bcc?.map(email => ({ email })),
        replyTo: options.replyTo ? { email: options.replyTo } : undefined,
        subject: options.subject,
        htmlContent: options.html,
        textContent: options.text,
        headers: options.headers,
      };

      const response = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': this.apiKey,
          'accept': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        this.logger.error(`Brevo API error: ${JSON.stringify(error)}`);
        return {
          success: false,
          provider: this.name,
          error: error.message || 'Failed to send email',
        };
      }

      const result = await response.json();
      return {
        success: true,
        messageId: result.messageId,
        provider: this.name,
      };
    } catch (error) {
      this.logger.error(`Brevo send error: ${error.message}`);
      return {
        success: false,
        provider: this.name,
        error: error.message,
      };
    }
  }

  async verify(): Promise<boolean> {
    return !!this.apiKey;
  }
}
