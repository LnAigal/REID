const DANGEROUS_TAGS = /<\s*\/?\s*(script|iframe|object|embed|form|input|textarea|button|meta|link|base|applet|style)\b[^>]*>/gi;
const DANGEROUS_ATTRS = /\s+(on\w+|javascript:|data:|vbscript:|expression\s*\()/gi;
const HTML_COMMENTS = /<!--[\s\S]*?-->/g;

export function sanitizeHtml(html: string): string {
  return html
    .replace(HTML_COMMENTS, '')
    .replace(DANGEROUS_TAGS, '')
    .replace(DANGEROUS_ATTRS, '');
}

export function sanitizeOptionalHtml(html: string | undefined | null): string | undefined | null {
  if (!html) return html;
  return sanitizeHtml(html);
}
