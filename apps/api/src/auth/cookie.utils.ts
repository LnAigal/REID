export function cookieDomain(): string | undefined {
  const domain = process.env.COOKIE_DOMAIN;
  if (!domain) return undefined;
  return domain.startsWith('.') ? domain : `.${domain}`;
}
