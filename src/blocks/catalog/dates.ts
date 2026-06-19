// TZ-safe ISO (YYYY-MM-DD) date helpers — ported from frontend_catalog/lib/dates.

export function todayISO(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function addDays(isoDate: string, n: number): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(Date.UTC(y, m - 1, d + n)).toISOString().split('T')[0];
}

export function nextDay(isoDate: string): string {
  return addDays(isoDate, 1);
}

/**
 * Format a backend money value for display. The catalog API sends prices as
 * JSON numbers (`float()`) and deposit amounts as Decimal strings
 * ("25000.00"). Keep up to 2 fractional digits so whole-baht prices read clean
 * ("1500.000000" → "1,500") while a real fractional deposit ("300.50" → "300.5")
 * isn't silently rounded away. Empty / non-numeric → "".
 */
export function money(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? n.toLocaleString('en-US', { maximumFractionDigits: 2 }) : '';
}

export function formatShortDate(isoDate: string, lang: 'en' | 'ru'): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return '';
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

/** Telegram deep link for catalog booking — mirrors frontend_catalog/services/deeplink. */
export function buildTelegramDeepLink(
  botUsername: string,
  vehicleId: string,
  dates?: { from?: string; to?: string },
): string {
  let payload = `bk_${vehicleId.replace(/-/g, '')}`;
  if (dates?.from && dates?.to) {
    payload += `_${dates.from.replace(/-/g, '')}_${dates.to.replace(/-/g, '')}`;
  }
  return `https://t.me/${botUsername}?start=${payload}`;
}
