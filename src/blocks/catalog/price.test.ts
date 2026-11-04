import { describe, expect, it } from 'vitest';
import { formatBahtCeil, formatDayPrice, formatMoney } from './price';

const NB = '\u00a0';

describe('formatDayPrice', () => {
  it('keeps cents for an uneven day price', () => {
    expect(formatDayPrice(1833.333333)).toBe(`1${NB}833.33`);
    expect(formatDayPrice(1833.5)).toBe(`1${NB}833.50`);
    expect(formatDayPrice(766.666667)).toBe('766.67');
  });

  it('shows a whole price without decimals', () => {
    expect(formatDayPrice(2000)).toBe(`2${NB}000`);
    expect(formatDayPrice(1500.004)).toBe(`1${NB}500`);
    expect(formatDayPrice(430)).toBe('430');
  });
});

describe('formatBahtCeil', () => {
  it('rounds up to whole baht, groups split by a non-breaking space', () => {
    expect(formatBahtCeil(1666.01)).toBe(`1${NB}667`);
    expect(formatBahtCeil(1666.67)).toBe(`1${NB}667`);
    expect(formatBahtCeil(2000)).toBe(`2${NB}000`);
    expect(formatBahtCeil(17000)).toBe(`17${NB}000`);
  });

  it('accepts API decimal strings and ignores float noise', () => {
    expect(formatBahtCeil('2200.00')).toBe(`2${NB}200`);
    expect(formatBahtCeil('1833.33')).toBe(`1${NB}834`);
    expect(formatBahtCeil(2000.0000000001)).toBe(`2${NB}000`);
    expect(formatBahtCeil(430)).toBe('430');
  });

  it('returns an empty string for a non-number', () => {
    expect(formatBahtCeil('')).toBe('');
    expect(formatBahtCeil(Number.NaN)).toBe('');
  });
});

describe('formatMoney', () => {
  it('keeps exact satang, groups split by a non-breaking space', () => {
    expect(formatMoney(41245)).toBe(`41${NB}245`);
    expect(formatMoney('300.50')).toBe('300.5');
    expect(formatMoney('25000.00')).toBe(`25${NB}000`);
    expect(formatMoney(1234567.891)).toBe(`1${NB}234${NB}567.89`);
  });

  it('returns an empty string for nothing or a non-number', () => {
    expect(formatMoney('')).toBe('');
    expect(formatMoney(null)).toBe('');
    expect(formatMoney(undefined)).toBe('');
    expect(formatMoney('abc')).toBe('');
  });
});
