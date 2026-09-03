import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

@ValidatorConstraint({ name: 'hasEmailContent', async: false })
export class HasEmailContent implements ValidatorConstraintInterface {
  validate(_value: unknown, args: ValidationArguments): boolean {
    const obj = args.object as Record<string, unknown>;
    return typeof obj.html === 'string' || typeof obj.text === 'string';
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'at least one of html or text must be provided';
  }
}

const MAX_HEADERS = 20;
const MAX_HEADER_KEY_LENGTH = 50;
const MAX_HEADER_VALUE_LENGTH = 500;
const BLOCKED_HEADERS = new Set(['to', 'from', 'cc', 'bcc', 'subject', 'reply-to']);

function hasControlChars(value: string): boolean {
  for (const char of value) {
    const code = char.charCodeAt(0);
    if (code < 0x20 || code === 0x7f) return true;
  }
  return false;
}

@ValidatorConstraint({ name: 'noControlCharacters', async: false })
export class NoControlCharacters implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    return typeof value !== 'string' || !hasControlChars(value);
  }

  defaultMessage(_args: ValidationArguments): string {
    return 'must not contain control characters';
  }
}

@ValidatorConstraint({ name: 'validHeaders', async: false })
export class ValidHeaders implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return true;
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > MAX_HEADERS) return false;
    return entries.every(
      ([key, val]) =>
        key.length <= MAX_HEADER_KEY_LENGTH &&
        !hasControlChars(key) &&
        !BLOCKED_HEADERS.has(key.toLowerCase()) &&
        typeof val === 'string' &&
        val.length <= MAX_HEADER_VALUE_LENGTH &&
        !hasControlChars(val),
    );
  }

  defaultMessage(_args: ValidationArguments): string {
    return `headers must have at most ${MAX_HEADERS} entries, keys up to ${MAX_HEADER_KEY_LENGTH} characters, string values up to ${MAX_HEADER_VALUE_LENGTH} characters without control characters, and must not override To, Cc, From, Bcc, Reply-To or Subject`;
  }
}
