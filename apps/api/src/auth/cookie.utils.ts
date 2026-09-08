import { ConfigService } from '@nestjs/config';

export function cookieDomain(config: ConfigService): string | undefined {
  const domain = config.get('COOKIE_DOMAIN');
  if (!domain) return undefined;
  return domain.startsWith('.') ? domain : `.${domain}`;
}
