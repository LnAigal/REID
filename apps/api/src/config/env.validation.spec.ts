import { validate } from './env.validation';

const base = {
  DATABASE_URL: 'postgresql://user:pass@localhost:5432/reid',
  JWT_SECRET: 'a'.repeat(32),
  CSRF_SECRET: 'b'.repeat(32),
  CORS_ORIGIN: 'http://localhost:3000',
  BREVO_API_KEY: 'x',
};

describe('env validation', () => {
  it('requires WEBHOOK_SECRET in production', () => {
    expect(() => validate({ ...base, NODE_ENV: 'production' })).toThrow(/WEBHOOK_SECRET/);
  });

  it('accepts production when WEBHOOK_SECRET is set', () => {
    expect(() =>
      validate({ ...base, NODE_ENV: 'production', WEBHOOK_SECRET: 'secret' }),
    ).not.toThrow();
  });

  it('does not require WEBHOOK_SECRET outside production', () => {
    expect(() => validate({ ...base, NODE_ENV: 'development' })).not.toThrow();
  });
});
