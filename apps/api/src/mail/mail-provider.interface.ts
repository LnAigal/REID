export interface SendMailOptions {
  from: string;
  to: string[];
  cc?: string[];
  bcc?: string[];
  replyTo?: string;
  subject: string;
  html?: string;
  text?: string;
  headers?: Record<string, string>;
}

export interface SendMailResult {
  success: boolean;
  messageId?: string;
  provider: string;
  error?: string;
}

export interface MailProvider {
  name: string;
  send(options: SendMailOptions): Promise<SendMailResult>;
  verify(): Promise<boolean>;
}
