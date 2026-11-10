// Pure helpers of the model / category pages: trims of a model (the unit that
// stands for a trim — `pickRepresentative` of the catalog), the «from» price
// condition. No price arithmetic — every sum comes from the server
// (`card_prices`, `pricing_seasons`).
import { isCurrentSeason } from '../blocks/catalog/PriceGrid';
import { formatBahtCeil } from '../blocks/catalog/price';
import { pickRepresentative } from '../blocks/VehicleCatalog';
import type { CatalogModelPage, CatalogModelUnit } from './types';

/** One trim of a model: its units, the unit that stands for it. */
export interface ModelVersion {
  /** Normalised trim ('' — no trim). */
  key: string;
  /** Trim as written in FMS ('' — no trim). */
  trim: string;
  /** Units of the trim, incoming order. */
  units: CatalogModelUnit[];
  /** The unit that stands for the trim (`pickRepresentative`). */
  unit: CatalogModelUnit;
  availableCount: number;
}

const trimKey = (trim: string | null | undefined) => (trim ?? '').trim().toLowerCase();

/** Trims of a model: no trim («Базовая») first, then alphabetically. */
export function buildVersions(units: readonly CatalogModelUnit[]): ModelVersion[] {
  const groups = new Map<string, CatalogModelUnit[]>();
  for (const u of units) {
    const key = trimKey(u.trim);
    const list = groups.get(key);
    if (list) list.push(u);
    else groups.set(key, [u]);
  }
  return Array.from(groups.entries())
    .map(([key, list]) => {
      const unit = pickRepresentative(list);
      return {
        key,
        trim: (unit.trim ?? '').trim(),
        units: list,
        unit,
        availableCount: list.filter((u) => u.is_available).length,
      };
    })
    .sort((a, b) => {
      if (!a.key !== !b.key) return a.key ? 1 : -1;
      return a.trim.localeCompare(b.trim);
    });
}

/** The trim shown first: the one with a unit free today, else freed earliest. */
export function defaultVersion(versions: readonly ModelVersion[]): ModelVersion | null {
  if (versions.length === 0) return null;
  const best = pickRepresentative(versions.map((v) => v.unit));
  return versions.find((v) => v.unit === best) ?? versions[0];
}

/** «15 декабря» / «15 December» — a date-only `free_from` as written (UTC,
 *  so SSR and the browser agree, like `formatCardDate`). */
export function formatLongDate(iso: string, locale: 'ru' | 'en'): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  });
}

/** Switcher caption: the trim, or «Базовая»/«Standard». */
export function trimLabel(trim: string, baseLabel: string): string {
  return trim.trim() || baseLabel;
}

function seatsOf(u: CatalogModelUnit): number | null {
  const n = typeof u.seats === 'number' ? u.seats : u.seats ? Number(u.seats) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

/** Line under the trim caption: seats when the trims differ by them, else the year. */
export function versionSubtitle(
  version: ModelVersion,
  versions: readonly ModelVersion[],
  seatsCount: (n: number) => string,
): string {
  const seats = new Set(versions.map((v) => seatsOf(v.unit)));
  const own = seatsOf(version.unit);
  if (seats.size > 1 && own !== null) return seatsCount(own);
  return version.unit.year ? String(version.unit.year) : '';
}

/**
 * Shortest rental that gets the unit's lowest per-day price: the period of the
 * current season (`pricing_seasons`) priced at `card_prices.per_day_min`. Not
 * found (older backend, no seasons) — the model row's `price_from_min_days`
 * when this unit carries the model's «from» price.
 */
export function priceFromMinDays(
  unit: CatalogModelUnit,
  today: string,
  model?: Pick<CatalogModelPage, 'price_from_per_day' | 'price_from_min_days'>,
): number | null {
  const cp = unit.card_prices;
  if (!cp) return null;
  const want = Math.round(parseFloat(cp.per_day_min) * 100);
  const periods = unit.pricing_periods ?? [];
  const seasons = unit.pricing_seasons ?? [];
  const season = seasons.find((s) => isCurrentSeason(s, today)) ?? seasons[0];
  if (season) {
    const matching = season.prices.flatMap((p, i) =>
      p !== null && p !== undefined && periods[i] && Math.round(Number(p) * 100) === want
        ? [periods[i].min_days]
        : [],
    );
    if (matching.length > 0) return Math.min(...matching);
  }
  if (model?.price_from_per_day && Math.round(parseFloat(model.price_from_per_day) * 100) === want) {
    return model.price_from_min_days;
  }
  return null;
}

/** Price block of a trim: «от N ฿ / сутки», its rental condition and the
 *  1-day price — all from the server (`card_prices`), rounded up to baht. */
export interface VersionPrice {
  /** Lowest per-day price, formatted («4 334»); null — on request. */
  from: string | null;
  /** 1-day (highest) per-day price; null when it equals `from` or is unknown. */
  maxDay: string | null;
  /** Shortest rental that gets `from`. */
  minDays: number | null;
}

export function versionPrice(
  unit: CatalogModelUnit,
  today: string,
  model?: Pick<CatalogModelPage, 'price_from_per_day' | 'price_from_min_days'>,
): VersionPrice {
  const cp = unit.card_prices;
  if (cp) {
    const from = formatBahtCeil(cp.per_day_min);
    const max = formatBahtCeil(cp.per_day_max);
    return { from, maxDay: max !== from ? max : null, minDays: priceFromMinDays(unit, today, model) };
  }
  if (unit.min_price_per_day !== null && unit.min_price_per_day !== undefined) {
    return { from: formatBahtCeil(unit.min_price_per_day), maxDay: null, minDays: null };
  }
  return { from: null, maxDay: null, minDays: null };
}

/** Editor text → paragraphs (split on blank lines, empty ones dropped). */
export function splitParagraphs(text: string): string[] {
  return text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
}

/** Cheapest «from» price of the models and the rental it needs (server values). */
export function cheapestModel(
  models: readonly CatalogModelPage[],
): { price: string; minDays: number | null } | null {
  let best: CatalogModelPage | null = null;
  for (const m of models) {
    if (!m.price_from_per_day) continue;
    if (!best || parseFloat(m.price_from_per_day) < parseFloat(best.price_from_per_day!)) best = m;
  }
  return best ? { price: formatBahtCeil(best.price_from_per_day!), minDays: best.price_from_min_days } : null;
}
