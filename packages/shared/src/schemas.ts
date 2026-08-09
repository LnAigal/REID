import { z } from 'zod';

export const PASSWORD_POLICY = {
  minLength: 8,
  maxLength: 72,
  regex:
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*[0-9]).*$/,
} as const;

export const EMAIL_MAX_LENGTH = 254;
export const SUBJECT_MAX_LENGTH = 998;
export const BODY_MAX_LENGTH = 50000;
export const EMAIL_RECIPIENTS_MAX = 50;
export const DOMAIN_NAME_REGEX = /^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/;

export const passwordSchema = z
  .string()
  .min(PASSWORD_POLICY.minLength, `Password must be at least ${PASSWORD_POLICY.minLength} characters`)
  .max(PASSWORD_POLICY.maxLength, `Password must be at most ${PASSWORD_POLICY.maxLength} characters`)
  .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
  .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
  .regex(/[0-9]/, 'Password must contain at least one number');

export const emailAddressSchema = z.string().email().max(EMAIL_MAX_LENGTH);

const recipientsSchema = z.array(emailAddressSchema).max(EMAIL_RECIPIENTS_MAX);

export const sendEmailSchema = z
  .object({
    from: emailAddressSchema,
    to: z.array(emailAddressSchema).min(1).max(EMAIL_RECIPIENTS_MAX),
    cc: recipientsSchema.optional(),
    bcc: recipientsSchema.optional(),
    replyTo: emailAddressSchema.optional(),
    subject: z.string().max(SUBJECT_MAX_LENGTH),
    html: z.string().max(BODY_MAX_LENGTH).optional(),
    text: z.string().max(BODY_MAX_LENGTH).optional(),
    headers: z.record(z.string(), z.string()).optional(),
  })
  .strict();

export const listEmailsQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
});

export const signupSchema = z
  .object({
    email: emailAddressSchema,
    name: z.string().min(1).max(100),
    password: passwordSchema,
  })
  .strict();

export const loginSchema = z
  .object({
    email: emailAddressSchema,
    password: z.string(),
  })
  .strict();

export const updateProfileSchema = z
  .object({
    name: z.string().max(100).optional(),
    avatarUrl: z
      .string()
      .url({ message: 'avatarUrl must be a valid URL' })
      .refine((url) => url.startsWith('https://'), 'avatarUrl must use https')
      .optional(),
  })
  .strict();

export const changePasswordSchema = z
  .object({
    currentPassword: z.string(),
    newPassword: passwordSchema,
  })
  .strict();

export const forgotPasswordSchema = z
  .object({
    email: emailAddressSchema,
  })
  .strict();

export const verifyEmailSchema = z
  .object({
    token: z.string().min(1),
  })
  .strict();

export const resetPasswordSchema = z
  .object({
    token: z.string(),
    password: passwordSchema,
  })
  .strict();

export const createApiKeySchema = z
  .object({
    name: z.string().min(1).max(100),
    type: z.enum(['LIVE', 'TEST']),
  })
  .strict();

export const createDomainSchema = z
  .object({
    name: z.string().regex(DOMAIN_NAME_REGEX),
  })
  .strict();
