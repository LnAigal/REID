import * as sanitize from 'sanitize-html';

const SANITIZE_OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p', 'div', 'span', 'br', 'hr',
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
    'ul', 'ol', 'li', 'blockquote',
    'a', 'strong', 'b', 'em', 'i', 'u', 's', 'strike',
    'sub', 'sup', 'small', 'code', 'pre',
    'table', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td', 'caption',
    'img',
  ],
  allowedAttributes: {
    '*': ['align', 'title', 'width', 'height', 'valign'],
    'a': ['href', 'name', 'target', 'rel'],
    'img': ['src', 'alt', 'width', 'height'],
    'td': ['colspan', 'rowspan'],
    'th': ['colspan', 'rowspan'],
    'table': ['border', 'cellpadding', 'cellspacing', 'bgcolor', 'width'],
  },
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
};

export function sanitizeHtml(html: string): string {
  return sanitize(html, SANITIZE_OPTIONS);
}export function sanitizeOptionalHtml(html: string | undefined | null): string | undefined | null {
  if (!html) return html;
  return sanitizeHtml(html);
}
