import { describe, expect, it } from 'vitest';
import { money, nextDay, todayISO } from './dates';

describe('money', () => {
  it('formats numbers (catalog prices arrive as JSON numbers)', () => {
    expect(money(1500)).toBe('1,500');
    expect(money(7000)).toBe('7,000');
  });

  it('strips Decimal-string trailing zeros (deposit amounts arrive as strings)', () => {
    expect(money('1500.000000')).toBe('1,500');
    expect(money('25000.00')).toBe('25,000');
  });

  it('keeps a real fractional value (does not silently round it away)', () => {
    expect(money('300.50')).toBe('300.5');
    expect(money(300.5)).toBe('300.5');
  });

  it('renders an explicit zero (the H2 case: monthly price 0 must still show)', () => {
    expect(money(0)).toBe('0');
    expect(money('0')).toBe('0');
  });

  it('returns empty string for empty / nullish / non-numeric input', () => {
    expect(money('')).toBe('');
    expect(money(null)).toBe('');
    expect(money(undefined)).toBe('');
    expect(money('abc')).toBe('');
  });
});

describe('date helpers', () => {
  it('nextDay advances one calendar day, TZ-safe across month end', () => {
    expect(nextDay('2026-01-31')).toBe('2026-02-01');
    expect(nextDay('2026-06-19')).toBe('2026-06-20');
  });

  it('todayISO is a well-formed YYYY-MM-DD', () => {
    expect(todayISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
