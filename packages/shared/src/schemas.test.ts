import { describe, it, expect } from 'vitest';
import { SendEmailSchema, SignupSchema, LoginSchema, CreateApiKeySchema, CreateDomainSchema, PaginationSchema } from './schemas';

describe('SendEmailSchema', () => {
  it('should validate a valid email', () => {
    const result = SendEmailSchema.safeParse({
      from: 'test@example.com',
      to: ['user@example.com'],
      subject: 'Test',
      html: '<p>Hello</p>',
    });
    expect(result.success).toBe(true);
  });

  it('should reject email without html or text', () => {
    const result = SendEmailSchema.safeParse({
      from: 'test@example.com',
      to: ['user@example.com'],
      subject: 'Test',
    });
    expect(result.success).toBe(false);
  });

  it('should reject email without recipients', () => {
    const result = SendEmailSchema.safeParse({
      from: 'test@example.com',
      to: [],
      subject: 'Test',
      html: '<p>Hello</p>',
    });
    expect(result.success).toBe(false);
  });

  it('should accept email with text only', () => {
    const result = SendEmailSchema.safeParse({
      from: 'test@example.com',
      to: ['user@example.com'],
      subject: 'Test',
      text: 'Hello',
    });
    expect(result.success).toBe(true);
  });
});

describe('SignupSchema', () => {
  it('should validate a valid signup', () => {
    const result = SignupSchema.safeParse({
      email: 'test@example.com',
      name: 'Test User',
      password: 'Password1',
    });
    expect(result.success).toBe(true);
  });

  it('should reject weak password', () => {
    const result = SignupSchema.safeParse({
      email: 'test@example.com',
      name: 'Test User',
      password: 'weak',
    });
    expect(result.success).toBe(false);
  });

  it('should reject invalid email', () => {
    const result = SignupSchema.safeParse({
      email: 'not-an-email',
      name: 'Test User',
      password: 'Password1',
    });
    expect(result.success).toBe(false);
  });
});

describe('LoginSchema', () => {
  it('should validate valid login', () => {
    const result = LoginSchema.safeParse({
      email: 'test@example.com',
      password: 'password',
    });
    expect(result.success).toBe(true);
  });

  it('should reject empty password', () => {
    const result = LoginSchema.safeParse({
      email: 'test@example.com',
      password: '',
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateApiKeySchema', () => {
  it('should validate LIVE key creation', () => {
    const result = CreateApiKeySchema.safeParse({ name: 'Production', type: 'LIVE' });
    expect(result.success).toBe(true);
  });

  it('should reject invalid type', () => {
    const result = CreateApiKeySchema.safeParse({ name: 'Test', type: 'INVALID' });
    expect(result.success).toBe(false);
  });
});

describe('CreateDomainSchema', () => {
  it('should validate a valid domain', () => {
    const result = CreateDomainSchema.safeParse({ name: 'example.com' });
    expect(result.success).toBe(true);
  });

  it('should reject domain with invalid characters', () => {
    const result = CreateDomainSchema.safeParse({ name: 'example_domain.com' });
    expect(result.success).toBe(false);
  });
});

describe('PaginationSchema', () => {
  it('should apply defaults', () => {
    const result = PaginationSchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
      expect(result.data.sortOrder).toBe('desc');
    }
  });

  it('should coerce page and limit to numbers', () => {
    const result = PaginationSchema.safeParse({ page: '2', limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });
});
