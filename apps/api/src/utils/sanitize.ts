const DANGEROUS_TAGS = /<\/?(?:script|iframe|object|embed|form|input|textarea|button|select|option|optgroup|datalist|keygen|output|progress|meter|label|legend|fieldset|isindex|marquee|applet|meta|link|base|basefont|style|title|head|body|html|frame|frameset|noframes|noembed|noscript|xmp|plaintext|listing|image|svg|math|annotation|annotation-xml|mi|mo|mn|ms|mtext|foreignObject|desc|title|animate|animateMotion|animateTransform|set|discard|handler|malignmark)\b[^>]*>/gi;
const DANGEROUS_ATTRS = /\s+(?:on\w+|formaction|formmethod|xlink:href|href|src|action|background|poster|codebase|data|longdesc|usemap|classid|archive)\s*=\s*(?:"[^"]*"|'[^']*'|[^\s>]+)/gi;
const DANGEROUS_PROTOCOLS = /(?:javascript|data|vbscript|blob|file|ftp):/gi;
const HTML_COMMENTS = /<!--[\s\S]*?-->/g;
const CDATA = /<!\[CDATA\[[\s\S]*?\]\]>/g;

export function sanitizeHtml(html: string): string {
  return html
    .replace(HTML_COMMENTS, '')
    .replace(CDATA, '')
    .replace(DANGEROUS_PROTOCOLS, 'blocked:')
    .replace(DANGEROUS_ATTRS, '')
    .replace(DANGEROUS_TAGS, '');
}

export function sanitizeOptionalHtml(html: string | undefined | null): string | undefined | null {
  if (!html) return html;
  return sanitizeHtml(html);
}
