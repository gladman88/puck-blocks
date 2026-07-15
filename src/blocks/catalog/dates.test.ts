import { describe, expect, it } from 'vitest';
import { buildTelegramDeepLink, money, nextDay, todayISO } from './dates';

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

  it('buildTelegramDeepLink encodes vehicle + optional dates (hyphens stripped)', () => {
    expect(buildTelegramDeepLink('bot', 'a-b-c')).toBe('https://t.me/bot?start=bk_abc');
    expect(buildTelegramDeepLink('bot', 'a-b-c', { from: '2026-06-19', to: '2026-06-20' })).toBe(
      'https://t.me/bot?start=bk_abc_20260619_20260620',
    );
  });

  it('appends the referral code when set, with or without dates', () => {
    expect(buildTelegramDeepLink('bot', 'a-b-c', undefined, 'AG1234')).toBe(
      'https://t.me/bot?start=bk_abc_AG1234',
    );
    expect(
      buildTelegramDeepLink('bot', 'a-b-c', { from: '2026-06-19', to: '2026-06-20' }, 'AG1234'),
    ).toBe('https://t.me/bot?start=bk_abc_20260619_20260620_AG1234');
  });

  it('omits the referral suffix when the code is null/empty', () => {
    expect(buildTelegramDeepLink('bot', 'a-b-c', undefined, null)).toBe('https://t.me/bot?start=bk_abc');
    expect(buildTelegramDeepLink('bot', 'a-b-c', undefined, '')).toBe('https://t.me/bot?start=bk_abc');
  });

  it('drops the dates segment (never truncates raw text) when a long referral code would overflow the 64-char Telegram limit', () => {
    const vehicleHex = '0'.repeat(32); // a real UUID hex is 32 chars
    const longCode = 'A'.repeat(20); // ReferralCode.code allows up to max_length=20
    const withDates = buildTelegramDeepLink(
      'bot',
      vehicleHex,
      { from: '2026-06-19', to: '2026-06-20' },
      longCode,
    );
    // bk_ + 32 + _YYYYMMDD_YYYYMMDD + _ + 20 = 74 chars would overflow — dates dropped, referral kept.
    expect(withDates).toBe(`https://t.me/bot?start=bk_${vehicleHex}_${longCode}`);
    expect(withDates.split('?start=')[1].length).toBeLessThanOrEqual(64);

    // The everyday case (6-char auto-generated code) fits and keeps the dates.
    const shortCode = 'AG1234';
    const everyday = buildTelegramDeepLink(
      'bot',
      vehicleHex,
      { from: '2026-06-19', to: '2026-06-20' },
      shortCode,
    );
    expect(everyday).toBe(`https://t.me/bot?start=bk_${vehicleHex}_20260619_20260620_${shortCode}`);
  });
});
