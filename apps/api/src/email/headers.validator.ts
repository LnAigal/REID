import { ValidatorConstraint, ValidatorConstraintInterface, ValidationArguments } from 'class-validator';

const MAX_HEADERS = 20;
const MAX_HEADER_KEY_LENGTH = 50;
const MAX_HEADER_VALUE_LENGTH = 500;

@ValidatorConstraint({ name: 'validHeaders', async: false })
export class ValidHeaders implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (!value || typeof value !== 'object' || Array.isArray(value)) return true;
    const entries = Object.entries(value as Record<string, unknown>);
    if (entries.length > MAX_HEADERS) return false;
    return entries.every(
      ([key, val]) =>
        key.length <= MAX_HEADER_KEY_LENGTH &&
        typeof val === 'string' &&
        val.length <= MAX_HEADER_VALUE_LENGTH,
    );
  }

  defaultMessage(_args: ValidationArguments): string {
    return `headers must have at most ${MAX_HEADERS} entries, keys up to ${MAX_HEADER_KEY_LENGTH} characters and string values up to ${MAX_HEADER_VALUE_LENGTH} characters`;
  }
}
