import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

const MAX_HEADERS = 20;
const MAX_HEADER_KEY_LENGTH = 50;
const MAX_HEADER_VALUE_LENGTH = 500;
const BLOCKED_HEADERS = new Set(['to', 'from', 'bcc', 'subject']);
const CONTROL_CHARS = /[\u0000-\u001f\u007f]/;

@ValidatorConstraint({ name: 'validHeaders', async: false })
export class ValidHeaders implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return true;
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > MAX_HEADERS) return false;
    return entries.every(
      ([key, val]) =>
        key.length <= MAX_HEADER_KEY_LENGTH &&
        !BLOCKED_HEADERS.has(key.toLowerCase()) &&
        typeof val === 'string' &&
        val.length <= MAX_HEADER_VALUE_LENGTH &&
        !CONTROL_CHARS.test(val),
    );
  }

  defaultMessage(_args: ValidationArguments): string {
    return `headers must have at most ${MAX_HEADERS} entries, keys up to ${MAX_HEADER_KEY_LENGTH} characters, string values up to ${MAX_HEADER_VALUE_LENGTH} characters without control characters, and must not override To, From, Bcc or Subject`;
  }
}
