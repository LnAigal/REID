import { z } from 'zod';

const envSchema = z
  .object({
    DATABASE_URL: z.string().startsWith('postgres://', 'DATABASE_URL must start with postgres:// or postgresql://').or(
      z.string().startsWith('postgresql://', 'DATABASE_URL must start with postgres:// or postgresql://'),
    ),
    JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters for HMAC-SHA256 security'),
    CSRF_SECRET: z.string().min(32, 'CSRF_SECRET must be at least 32 characters for HMAC-SHA256 security'),
    COOKIE_DOMAIN: z.string().optional(),
    JWT_EXPIRATION: z.string().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    CORS_ORIGIN: z.string(),
    API_PREFIX: z.string().optional(),
    API_PORT: z.coerce.number().int().positive().optional(),
    TRUST_PROXY: z
      .string()
      .default('false')
      .refine((value) => value === 'false' || value === 'true' || /^\d+$/.test(value), {
        message: 'TRUST_PROXY must be "false", "true", or a hop count like "1"',
      }),
    BREVO_API_KEY: z.string().optional(),
    DEFAULT_MAIL_PROVIDER: z.enum(['brevo', 'custom_smtp']).default('brevo'),
    APP_NAME: z.string().optional(),
    APP_URL: z.string().url(),
    VERIFICATION_FROM_EMAIL: z.string().email().optional(),
    SMTP_HOST: z.string().optional(),
    SMTP_PORT: z.coerce.number().int().positive().optional(),
    SMTP_SECURE: z.string().optional(),
    SMTP_USER: z.string().optional(),
    SMTP_PASS: z.string().optional(),
    WEBHOOK_SECRET: z.string().optional(),
    ALLOW_UNSIGNED_WEBHOOKS: z
      .enum(['true', 'false'])
      .optional()
      .superRefine((value, ctx) => {
        if (value === 'true' && process.env.NODE_ENV === 'production') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: ['ALLOW_UNSIGNED_WEBHOOKS'],
            message: 'ALLOW_UNSIGNED_WEBHOOKS cannot be enabled when NODE_ENV is production',
          });
        }
      }),
  })
  .superRefine((env, ctx) => {
    if (env.DEFAULT_MAIL_PROVIDER === 'brevo' && !env.BREVO_API_KEY) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['BREVO_API_KEY'],
        message: 'BREVO_API_KEY is required when DEFAULT_MAIL_PROVIDER is brevo',
      });
    }
    if (env.NODE_ENV === 'production' && !env.WEBHOOK_SECRET) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['WEBHOOK_SECRET'],
        message: 'WEBHOOK_SECRET is required when NODE_ENV is production',
      });
    }
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
