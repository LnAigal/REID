import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { MailProvider, SendMailOptions, SendMailResult } from '../mail-provider.interface';

@Injectable()
export class CustomSmtpProvider implements MailProvider {
  name = 'custom_smtp';
  private readonly logger = new Logger(CustomSmtpProvider.name);

  constructor(private config: ConfigService) {}

  async send(options: SendMailOptions): Promise<SendMailResult> {
    try {
      const nodemailer = await import('nodemailer');
      const transporter = nodemailer.createTransport({
        host: this.config.get('SMTP_HOST'),
        port: this.config.get('SMTP_PORT', 587),
        secure: this.config.get('SMTP_SECURE', 'false') === 'true',
        auth: {
          user: this.config.get('SMTP_USER'),
          pass: this.config.get('SMTP_PASS'),
        },
      });

      const info = await transporter.sendMail({
        from: options.from,
        to: options.to.join(', '),
        cc: options.cc?.join(', '),
        bcc: options.bcc?.join(', '),
        replyTo: options.replyTo,
        subject: options.subject,
        html: options.html,
        text: options.text,
        headers: options.headers,
      });

      return {
        success: true,
        messageId: info.messageId,
        provider: this.name,
      };
    } catch (error) {
      this.logger.error(`Custom SMTP error: ${error.message}`);
      return {
        success: false,
        provider: this.name,
        error: error.message,
      };
    }
  }

  async verify(): Promise<boolean> {
    return !!(
      this.config.get('SMTP_HOST') &&
      this.config.get('SMTP_USER') &&
      this.config.get('SMTP_PASS')
    );
  }
}
