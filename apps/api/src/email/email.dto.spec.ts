import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { SendEmailDto } from './email.controller';

const base = {
  from: 'sender@example.com',
  to: ['recipient@example.com'],
  subject: 'Hello',
};

describe('SendEmailDto', () => {
  async function errorsFor(overrides: Record<string, unknown>) {
    const dto = plainToInstance(SendEmailDto, { ...base, ...overrides });
    return validate(dto);
  }

  it('accepts a valid payload', async () => {
    const errors = await errorsFor({});
    expect(errors).toHaveLength(0);
  });

  it('rejects more than 50 recipients', async () => {
    const to = Array.from({ length: 51 }, (_, i) => `user${i}@example.com`);
    const errors = await errorsFor({ to });
    expect(errors.map((e) => e.property)).toContain('to');
  });

  it('rejects a subject longer than 998 characters', async () => {
    const errors = await errorsFor({ subject: 'x'.repeat(999) });
    expect(errors.map((e) => e.property)).toContain('subject');
  });

  it('rejects an email address longer than 254 characters', async () => {
    const errors = await errorsFor({ from: `${'a'.repeat(250)}@example.com` });
    expect(errors.map((e) => e.property)).toContain('from');
  });

  it('rejects more than 20 headers', async () => {
    const headers = Object.fromEntries(
      Array.from({ length: 21 }, (_, i) => [`X-Header-${i}`, 'value']),
    );
    const errors = await errorsFor({ headers });
    expect(errors.map((e) => e.property)).toContain('headers');
  });

  it('rejects non-string header values', async () => {
    const errors = await errorsFor({ headers: { 'X-Api-Key': 123 as unknown as string } });
    expect(errors.map((e) => e.property)).toContain('headers');
  });

  it('accepts a reasonable set of headers', async () => {
    const headers = { 'X-Transaction-Id': 'abc-123', ReplyTo: 'ops@example.com' };
    const errors = await errorsFor({ headers });
    expect(errors).toHaveLength(0);
  });

  it('rejects headers that override routing fields', async () => {
    for (const name of ['To', 'from', 'BCC', 'SUBJECT']) {
      const errors = await errorsFor({ headers: { [name]: 'hijack@example.com' } });
      expect(errors.map((e) => e.property)).toContain('headers');
    }
  });

  it('rejects header values containing control characters', async () => {
    for (const value of ['a\r\nBcc: victim@example.com', 'line1\nline2']) {
      const errors = await errorsFor({ headers: { 'X-Custom': value } });
      expect(errors.map((e) => e.property)).toContain('headers');
    }
  });
});
