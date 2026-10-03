import { describe, expect, it } from 'vitest';
import { formatDayPrice } from './price';

describe('formatDayPrice', () => {
  it('keeps cents for an uneven day price', () => {
    expect(formatDayPrice(1833.333333)).toBe('1,833.33');
    expect(formatDayPrice(1833.5)).toBe('1,833.50');
    expect(formatDayPrice(766.666667)).toBe('766.67');
  });

  it('shows a whole price without decimals', () => {
    expect(formatDayPrice(2000)).toBe('2,000');
    expect(formatDayPrice(1500.004)).toBe('1,500');
    expect(formatDayPrice(430)).toBe('430');
  });
});
