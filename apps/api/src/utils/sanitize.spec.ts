import { sanitizeHtml, sanitizeOptionalHtml } from './sanitize';

describe('sanitizeHtml', () => {
  it('removes script tags entirely', () => {
    expect(sanitizeHtml('<script>alert(1)</script><p>hi</p>')).toBe('<p>hi</p>');
  });

  it('strips event handler attributes', () => {
    expect(sanitizeHtml('<img src="x" onerror="alert(1)">')).toBe('<img src="x" />');
  });

  it('blocks javascript: URLs', () => {
    expect(sanitizeHtml('<a href="javascript:alert(1)">click</a>')).toBe('<a>click</a>');
  });

  it('blocks protocol-relative URLs', () => {
    expect(sanitizeHtml('<a href="//evil.com">click</a>')).toBe('<a>click</a>');
  });

  it('removes svg/math namespaces', () => {
    expect(sanitizeHtml('<svg onload="alert(1)"></svg>')).toBe('');
  });

  it('strips inline styles used for CSS exfiltration', () => {
    expect(sanitizeHtml('<div style="background:url(https://evil.com)">x</div>')).toBe('<div>x</div>');
  });

  it('preserves safe email markup', () => {
    const input = '<table><tr><td>cell</td></tr></table>';
    expect(sanitizeHtml(input)).toBe(input);
  });

  it('passes through empty values in sanitizeOptionalHtml', () => {
    expect(sanitizeOptionalHtml(undefined)).toBeUndefined();
    expect(sanitizeOptionalHtml(null)).toBeNull();
    expect(sanitizeOptionalHtml('')).toBe('');
  });
});
