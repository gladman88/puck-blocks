// TZ-safe ISO (YYYY-MM-DD) date helpers — ported from frontend_catalog/lib/dates.

/** Пояс компании (Пхукет). Константа намеренно: блоки не читают настроек компании
 *  (владелец 2026-10-03). Сменят `CompanySettings.timezone` — править здесь. */
export const COMPANY_TIME_ZONE = 'Asia/Bangkok';

/** «Сегодня» — день на Пхукете, а не на устройстве клиента: даты аренды — даты
 *  выдачи машины. Иначе вечером в России календарь давал выбрать день, который на
 *  Пхукете уже прошёл. */
export function todayISO(now: Date = new Date()): string {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: COMPANY_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit',
  }).formatToParts(now);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return `${part('year')}-${part('month')}-${part('day')}`;
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

/** «4 дня» / “4 days” — число со склонённым словом «день». */
export function pluralDays(n: number, lang: 'en' | 'ru'): string {
  if (lang === 'en') return `${n} ${n === 1 ? 'day' : 'days'}`;
  const a = Math.abs(n) % 10;
  const b = Math.abs(n) % 100;
  const word = a === 1 && b !== 11 ? 'день' : a >= 2 && a <= 4 && (b < 12 || b > 14) ? 'дня' : 'дней';
  return `${n} ${word}`;
}

function utcDate(isoDate: string): Date | null {
  if (!isoDate) return null;
  const [y, m, d] = isoDate.split('-').map(Number);
  if (!y || !m || !d) return null;
  return new Date(Date.UTC(y, m - 1, d));
}

const dayMonthFormatters: Partial<Record<'en' | 'ru', Intl.DateTimeFormat>> = {};
function dayMonthParts(date: Date, lang: 'en' | 'ru'): { day: string; month: string } {
  const fmt = (dayMonthFormatters[lang] ??= new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    timeZone: 'UTC',
  }));
  const parts = fmt.formatToParts(date);
  const part = (type: string) => parts.find((p) => p.type === type)?.value ?? '';
  return { day: part('day'), month: part('month') };
}

/** Короткая дата без года: «1 нояб.» / “1 Nov”. Вход — ISO `YYYY-MM-DD`. */
export function formatDayMonth(isoDate: string, lang: 'en' | 'ru'): string {
  const date = utcDate(isoDate);
  if (!date) return '';
  const { day, month } = dayMonthParts(date, lang);
  return `${day} ${month}`;
}

/** Короткий промежуток: «1–5 нояб.» в одном месяце, «30 окт. – 2 нояб.» в разных,
 *  одна дата — если концы совпали. */
export function formatDayMonthRange(fromISO: string, toISO: string, lang: 'en' | 'ru'): string {
  const from = utcDate(fromISO);
  const to = utcDate(toISO);
  if (!from || !to) return '';
  if (fromISO === toISO) return formatDayMonth(fromISO, lang);
  const sameMonth =
    from.getUTCFullYear() === to.getUTCFullYear() && from.getUTCMonth() === to.getUTCMonth();
  if (sameMonth) {
    const a = dayMonthParts(from, lang);
    const b = dayMonthParts(to, lang);
    return `${a.day}–${b.day} ${b.month}`;
  }
  return `${formatDayMonth(fromISO, lang)} – ${formatDayMonth(toISO, lang)}`;
}

/** Число дней между двумя ISO-датами (`to` − `from`). */
export function daysBetween(fromISO: string, toISO: string): number {
  const from = utcDate(fromISO);
  const to = utcDate(toISO);
  if (!from || !to) return 0;
  return Math.round((to.getTime() - from.getTime()) / 86400000);
}
