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

/**
 * Compact, locale-independent numeric date (ДД.ММ.ГГГГ) for the catalog filter
 * chips. We render this OURSELVES instead of relying on the native
 * `<input type="date">` value, which iOS paints in an uncontrollable locale
 * format ("17 Jul 2026") that wraps to two lines and breaks the filter row.
 * Input is an ISO `YYYY-MM-DD` string (already zero-padded).
 */
/**
 * Opens the native date picker where a custom date-chip hides the browser's
 * calendar indicator. Callers must opt in: the catalog filter relies on the
 * browser's default click behavior because mobile WebViews can commit a value
 * early when showPicker() is invoked from its click handler.
 */
export function openNativeDatePicker(el: HTMLInputElement): void {
  try {
    (el as HTMLInputElement & { showPicker?: () => void }).showPicker?.();
  } catch {
    // Older browsers still open their native picker from the input's own tap.
  }
}

export function formatDDMMYYYY(isoDate: string): string {
  if (!isoDate) return '';
  const [y, m, d] = isoDate.split('-');
  if (!y || !m || !d) return '';
  return `${d}.${m}.${y}`;
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
