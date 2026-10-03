/**
 * Цена дня для клиента: до сотых, без хвостовых нулей у ровной цены.
 * 1833.333333 → "1,833.33", 2000 → "2,000", 1833.5 → "1,833.50".
 *
 * Копейки показываем честно: цена дня последнего тарифа часто получена
 * делением суммы за 30 дней (55 000 / 30), и округление до целого давало бы
 * на экране «30 × 1,833 = 55,000», что не сходится.
 */
export function formatDayPrice(value: number): string {
  const rounded = Math.round(value * 100) / 100;
  const digits = Number.isInteger(rounded) ? 0 : 2;
  return rounded.toLocaleString('en-US', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  });
}
