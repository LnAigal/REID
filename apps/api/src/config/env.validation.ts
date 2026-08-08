import { z } from 'zod';

const envSchema = z.object({
  DATABASE_URL: z.string().url().or(z.string().min(1)),
  JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for HMAC-SHA256 security'),
  CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters for HMAC-SHA256 security'),
  COOKIE_DOMAIN: z.string().optional(),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  CORS_ORIGIN: z.string().url(),
  API_PREFIX: z.string().optional(),
  API_PORT: z.coerce.number().int().positive().optional(),
  TRUST_PROXY: z.enum(['true', 'false']).default('false'),
  BREVO_API_KEY: z.string().optional(),
  DEFAULT_MAIL_PROVIDER: z.enum(['brevo', 'custom_smtp']).default('brevo'),
  APP_NAME: z.string().optional(),
  APP_URL: z.string().url().optional(),
  VERIFICATION_FROM_EMAIL: z.string().email().optional(),
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.coerce.number().int().positive().optional(),
  SMTP_SECURE: z.string().optional(),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  WEBHOOK_SECRET: z.string().optional(),
});

export function validate(config: Record<string, unknown>) {
  const parsed = envSchema.safeParse(config);
  if (!parsed.success) {
    const errors = parsed.error.issues
      .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
      .join('\n');
    throw new Error(`Invalid environment variables:\n${errors}`);
  }
  return parsed.data;
}
