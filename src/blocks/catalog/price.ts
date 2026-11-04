/** Group separator of every price in the card and the vehicle window
 *  (approved mockups: «40 845 ฿») — a non-breaking space, so a sum never wraps. */
export const NBSP = '\u00a0';

function groupNbsp(formatted: string): string {
  return formatted.replace(/,/g, NBSP);
}

/**
 * Цена дня для клиента: до сотых, без хвостовых нулей у ровной цены.
 * 1833.333333 → "1 833.33", 2000 → "2 000", 1833.5 → "1 833.50" (группы —
 * неразрывным пробелом).
 *
 * Копейки показываем честно: цена дня последнего тарифа часто получена
 * делением суммы за 30 дней (55 000 / 30), и округление до целого давало бы
 * на экране «30 × 1,833 = 55,000», что не сходится.
 */
export function formatDayPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const digits = Number.isInteger(rounded) ? 0 : 2;
  return groupNbsp(
    rounded.toLocaleString('en-US', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }),
  );
}

/**
 * An exact money amount of the window («Стоимость», «Итого» of the success
 * screen, deposits): up to satang, no trailing zeros, groups split by a
 * non-breaking space. 41245 → «41 245», "300.50" → «300.5». Empty for
 * nothing / not a number.
 */
export function formatMoney(value: string | number | null | undefined): string {
  if (value == null || value === '') return '';
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Number.isFinite(n) ? groupNbsp(n.toLocaleString('en-US', { maximumFractionDigits: 2 })) : '';
}

/**
 * Whole baht, ALWAYS rounded up (owner 2026-11-04): 1666.01 → «1 667»,
 * 2000 → «2 000». Groups are split by a non-breaking space so a price never
 * wraps. The epsilon keeps a float that is whole in fact (2000.0000000001
 * after a division on the server side) from being bumped to the next baht.
 * Used by the card and the vehicle window (per-day range, 7/14/30-day sums,
 * the season price grid); the booking «Стоимость» block keeps exact sums.
 */
export function formatBahtCeil(value: number | string): string {
  const n = typeof value === 'number' ? value : parseFloat(value);
  if (!Number.isFinite(n)) return '';
  return Math.ceil(n - 1e-9)
    .toLocaleString('en-US')
    .replace(/,/g, ' ');
}
