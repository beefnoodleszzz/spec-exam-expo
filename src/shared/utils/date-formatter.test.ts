import { describe, expect, it } from 'vitest';
import { formatDate } from './date-formatter';

describe('formatDate', () => {
  it('formats standard ISO string', () => {
    expect(formatDate('2023-01-01T12:00:00Z')).toBe('2023-01-01 12:00');
  });

  it('handles null or undefined gracefully', () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate(undefined)).toBeNull();
  });

  it('returns raw string if not an ISO string', () => {
    expect(formatDate('2023/01/01 12:00:00')).toBe('2023/01/01 12:00:00');
  });

  it('returns raw string for invalid inputs that are still strings', () => {
    expect(formatDate('invalid-date')).toBe('invalid-date');
  });
});
