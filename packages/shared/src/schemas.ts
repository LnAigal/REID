import { z } from 'zod';

export const SendEmailSchema = z.object({
  from: z.string().email('Invalid from address'),
  to: z.array(z.string().email()).min(1, 'At least one recipient required'),
  cc: z.array(z.string().email()).optional().default([]),
  bcc: z.array(z.string().email()).optional().default([]),
  replyTo: z.string().email().optional(),
  subject: z.string().min(1, 'Subject is required').max(998),
  html: z.string().optional(),
  text: z.string().optional(),
  headers: z.record(z.string()).optional(),
  attachments: z.array(z.object({
    filename: z.string(),
    content: z.string(),
    contentType: z.string().optional(),
  })).optional(),
}).refine(data => data.html || data.text, {
  message: 'Either html or text content is required',
});

export type SendEmailInput = z.infer<typeof SendEmailSchema>;

export const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  name: z.string().min(1, 'Name is required').max(100),
  password: z.string().min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const CreateApiKeySchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  type: z.enum(['LIVE', 'TEST']),
});

export const CreateDomainSchema = z.object({
  name: z.string().regex(/^[a-z0-9]([a-z0-9-]*[a-z0-9])?(\.[a-z0-9]([a-z0-9-]*[a-z0-9])?)*$/, 'Invalid domain name'),
});

export const PaginationSchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional().default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).optional().default('desc'),
});

export type PaginationInput = z.infer<typeof PaginationSchema>;
