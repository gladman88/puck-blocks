import { useId } from 'react';
import { pluralDays } from './dates';
import { formatBahtCeil } from './price';

/** A rental period column — `pricing_periods` of the vehicle detail. */
export interface PricingPeriod {
  min_days: number;
  /** null = open-ended («28+»). */
  max_days: number | null;
}

/** One season row — `pricing_seasons` of the vehicle detail. Dates are ISO,
 *  `end_date` inclusive; `prices[i]` is the per-day price for `periods[i]`
 *  (decimal string, null = no price row). No season name: it is owner data in
 *  Russian only, the label is built from the dates. */
export interface PricingSeason {
  start_date: string;
  end_date: string;
  prices: (string | number | null)[];
}

const S = {
  ru: {
    title: 'Цены по сезонам',
    unit: 'за сутки, ฿',
    season: 'Сезон',
    legend: ['Столбец — срок ', 'всей', ' аренды в днях, строка — сезон. Если аренда захватывает два сезона, дни каждого сезона считаются по его цене.'],
    months: ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
    monthsShort: ['янв', 'фев', 'мар', 'апр', 'май', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
  },
  en: {
    title: 'Prices by season',
    unit: 'per day, ฿',
    season: 'Season',
    legend: ['Column — length of the ', 'whole', ' rental in days, row — season. If a rental spans two seasons, the days of each season are charged at its price.'],
    months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
    monthsShort: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
  },
} as const;

/** Column caption: «1 день» / «2–3» / «28+» (en «1 day»). */
export function periodLabel(p: PricingPeriod, locale: 'ru' | 'en'): string {
  if (p.max_days === null) return `${p.min_days}+`;
  if (p.min_days === p.max_days) return pluralDays(p.min_days, locale);
  return `${p.min_days}–${p.max_days}`;
}

function parseISO(iso: string): { y: number; m: number; d: number } | null {
  const [y, m, d] = iso.split('-').map(Number);
  return y && m && d ? { y, m, d } : null;
}

function lastDayOfMonth(y: number, m: number): number {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/**
 * Row caption from the season dates: «Ноябрь» / «2026» for one whole month,
 * «дек – фев» / «2026–2027» for whole months, «1–15 дек» for part of a month
 * (so two seasons inside one month never get the same label).
 */
export function seasonLabel(
  start: string,
  end: string,
  locale: 'ru' | 'en',
): { name: string; years: string } {
  const t = S[locale];
  const a = parseISO(start);
  const b = parseISO(end);
  if (!a || !b) return { name: `${start} – ${end}`, years: '' };
  const years = a.y === b.y ? String(a.y) : `${a.y}–${b.y}`;
  const wholeMonths = a.d === 1 && b.d === lastDayOfMonth(b.y, b.m);
  const sameMonth = a.y === b.y && a.m === b.m;
  if (wholeMonths) {
    return {
      name: sameMonth ? t.months[a.m - 1] : `${t.monthsShort[a.m - 1]} – ${t.monthsShort[b.m - 1]}`,
      years,
    };
  }
  const name = sameMonth
    ? `${a.d}–${b.d} ${t.monthsShort[b.m - 1]}`
    : `${a.d} ${t.monthsShort[a.m - 1]} – ${b.d} ${t.monthsShort[b.m - 1]}`;
  return { name, years };
}

export interface PriceGridProps {
  periods: PricingPeriod[];
  /** Nearest seasons first. */
  seasons: PricingSeason[];
  /** ISO day the «current» season is taken for: the start of the catalog's
   *  date window, else «today» of the availability response. The row whose
   *  dates contain it is highlighted; none contains it (or null) → no highlight. */
  referenceDate: string | null;
  locale: 'ru' | 'en';
  /** The «Цены по сезонам · за сутки, ฿» caption above the table (default
   *  on). Off — a host with its own heading; the table is then labelled by
   *  `aria-label` with the same text. */
  showLabel?: boolean;
}

/** The season that contains `day` (ISO dates compare as strings). */
export function isCurrentSeason(season: PricingSeason, day: string | null): boolean {
  return !!day && season.start_date <= day && day <= season.end_date;
}

/**
 * «Все цены» of the vehicle window (approved 2026-11-04): rows — seasons,
 * columns — rental periods, per-day prices in whole baht rounded up. The
 * current season is softly highlighted with a gold edge bar; the last (longest)
 * period is gold. Rows run edge to edge of the window: the host sets
 * `--sb-pg-bleed` to its side padding. Digits shrink on a narrow window
 * (container query units in styles.css) so five-digit prices fit 360 px.
 */
export function PriceGrid({ periods, seasons, referenceDate, locale, showLabel = true }: PriceGridProps) {
  const t = S[locale];
  const titleId = useId();
  if (periods.length === 0 || seasons.length === 0) return null;
  const last = periods.length - 1;

  return (
    <div className="sb-pgrid">
      {showLabel ? (
        <p className="sb-vd__lab" id={titleId}>
          {t.title} <em>· {t.unit}</em>
        </p>
      ) : null}
      <div className="sb-pgrid__wrap">
        <table
          className="sb-pgrid__table"
          aria-labelledby={showLabel ? titleId : undefined}
          aria-label={showLabel ? undefined : `${t.title} · ${t.unit}`}
        >
          <thead>
            <tr>
              <th scope="col">{t.season}</th>
              {periods.map((p, i) => (
                <th scope="col" key={i}>
                  {periodLabel(p, locale)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {seasons.map((s) => {
              const label = seasonLabel(s.start_date, s.end_date, locale);
              return (
                <tr
                  key={`${s.start_date}-${s.end_date}`}
                  className={isCurrentSeason(s, referenceDate) ? 'is-now' : undefined}
                >
                  <th scope="row">
                    {label.name}
                    {label.years ? <small>{label.years}</small> : null}
                  </th>
                  {periods.map((_, i) => {
                    const raw = s.prices[i];
                    const value = raw === null || raw === undefined || raw === '' ? '' : formatBahtCeil(raw);
                    return (
                      <td key={i} className={i === last ? 'is-best' : undefined}>
                        {value || '—'}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="sb-pgrid__legend">
        {t.legend[0]}
        <b>{t.legend[1]}</b>
        {t.legend[2]}
      </p>
    </div>
  );
}
