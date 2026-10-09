import { describe, expect, it, vi } from 'vitest';
import { COMPANY_TIME_ZONE, daysBetween, formatDDMMYYYY, formatDayMonth, formatDayMonthRange, money, nextDay, openNativeDatePicker, pluralDays, todayISO } from './dates';

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

  it('formatDDMMYYYY renders the ISO date as ДД.ММ.ГГГГ (zero-padding preserved)', () => {
    expect(formatDDMMYYYY('2026-07-17')).toBe('17.07.2026');
    expect(formatDDMMYYYY('2026-01-05')).toBe('05.01.2026');
  });

  it('formatDDMMYYYY returns empty for empty/malformed input', () => {
    expect(formatDDMMYYYY('')).toBe('');
    expect(formatDDMMYYYY('nope')).toBe('');
  });
});

describe('todayISO', () => {
  it('returns the Phuket day, not the device day (evening in Russia is already tomorrow there)', () => {
    expect(todayISO(new Date('2026-10-02T19:30:00Z'))).toBe('2026-10-03'); // 02:30 на Пхукете
  });

  it('is still yesterday just before Phuket midnight', () => {
    expect(todayISO(new Date('2026-10-02T16:59:00Z'))).toBe('2026-10-02'); // 23:59 на Пхукете
  });

  it('rolls over exactly at Phuket midnight', () => {
    expect(todayISO(new Date('2026-10-02T17:00:00Z'))).toBe('2026-10-03'); // 00:00 на Пхукете
  });

  it('pins the company time zone constant', () => {
    expect(COMPANY_TIME_ZONE).toBe('Asia/Bangkok');
  });
});

describe('openNativeDatePicker', () => {
  it('calls showPicker() when the browser supports it', () => {
    const showPicker = vi.fn();
    openNativeDatePicker({ showPicker } as unknown as HTMLInputElement);
    expect(showPicker).toHaveBeenCalledTimes(1);
  });

  it('is a no-op (no throw) when showPicker is unavailable (Safari < 16)', () => {
    expect(() => openNativeDatePicker({} as HTMLInputElement)).not.toThrow();
  });

  it('swallows a throwing showPicker (e.g. not user-activated)', () => {
    const showPicker = vi.fn(() => {
      throw new Error('NotAllowedError');
    });
    expect(() => openNativeDatePicker({ showPicker } as unknown as HTMLInputElement)).not.toThrow();
  });
});

describe('pluralDays', () => {
  it('declines the Russian word by the number', () => {
    expect(pluralDays(1, 'ru')).toBe('1 день');
    expect(pluralDays(2, 'ru')).toBe('2 дня');
    expect(pluralDays(4, 'ru')).toBe('4 дня');
    expect(pluralDays(5, 'ru')).toBe('5 дней');
    expect(pluralDays(11, 'ru')).toBe('11 дней');
    expect(pluralDays(12, 'ru')).toBe('12 дней');
    expect(pluralDays(21, 'ru')).toBe('21 день');
    expect(pluralDays(22, 'ru')).toBe('22 дня');
    expect(pluralDays(111, 'ru')).toBe('111 дней');
  });

  it('uses singular / plural in English', () => {
    expect(pluralDays(1, 'en')).toBe('1 day');
    expect(pluralDays(4, 'en')).toBe('4 days');
  });
});

describe('formatDayMonth / formatDayMonthRange', () => {
  it('formats a short date without the year', () => {
    expect(formatDayMonth('2026-11-01', 'ru')).toBe('1 нояб.');
    expect(formatDayMonth('2026-10-12', 'ru')).toBe('12 окт.');
    expect(formatDayMonth('2026-11-01', 'en')).toBe('1 Nov');
    expect(formatDayMonth('', 'ru')).toBe('');
  });

  it('does not shift the day in a negative-offset zone (UTC formatting)', () => {
    // 00:00 UTC of the 1st is still Oct 31 in the Americas — the formatter pins UTC.
    expect(formatDayMonth('2026-11-01', 'en')).toBe('1 Nov');
  });

  it('collapses a same-month range and spells out a cross-month one', () => {
    expect(formatDayMonthRange('2026-11-01', '2026-11-05', 'ru')).toBe('1–5 нояб.');
    expect(formatDayMonthRange('2026-11-01', '2026-11-05', 'en')).toBe('1–5 Nov');
    expect(formatDayMonthRange('2026-10-30', '2026-11-02', 'ru')).toBe('30 окт. – 2 нояб.');
    expect(formatDayMonthRange('2026-11-01', '2026-11-01', 'ru')).toBe('1 нояб.');
    // Same month number, different year → not collapsed.
    expect(formatDayMonthRange('2026-11-01', '2027-11-05', 'en')).toBe('1 Nov – 5 Nov');
  });
});

describe('daysBetween', () => {
  it('counts calendar days across a month boundary', () => {
    expect(daysBetween('2026-11-01', '2026-11-05')).toBe(4);
    expect(daysBetween('2026-10-30', '2026-11-02')).toBe(3);
    expect(daysBetween('', '2026-11-02')).toBe(0);
  });
});
