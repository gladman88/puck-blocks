// Pure helpers of the model / category pages: trims of a model, the «from»
// price block. No ordering, picking or price arithmetic — the backend sends the
// units in their order (`default_unit_id` first), each with its
// `price_from_min_days`; every sum comes from the server (`card_prices`).
import { formatBahtCeil } from '../blocks/catalog/price';
import type { CatalogModelPage, CatalogModelUnit } from './types';

/** One trim of a model: its units, the unit that stands for it. */
export interface ModelVersion {
  /** Normalised trim ('' — no trim). */
  key: string;
  /** Trim as written in FMS ('' — no trim). */
  trim: string;
  /** Units of the trim, backend order. */
  units: CatalogModelUnit[];
  /** The unit that stands for the trim — its first in the backend order. */
  unit: CatalogModelUnit;
  availableCount: number;
}

const trimKey = (trim: string | null | undefined) => (trim ?? '').trim().toLowerCase();

/** Trims of a model in the backend order of their units (a trim stands where
 *  its first unit does); the unit of a trim — its first one. */
export function buildVersions(units: readonly CatalogModelUnit[]): ModelVersion[] {
  const groups = new Map<string, CatalogModelUnit[]>();
  for (const u of units) {
    const key = trimKey(u.trim);
    const list = groups.get(key);
    if (list) list.push(u);
    else groups.set(key, [u]);
  }
  return Array.from(groups.entries()).map(([key, list]) => ({
    key,
    trim: (list[0].trim ?? '').trim(),
    units: list,
    unit: list[0],
    availableCount: list.filter((u) => u.is_available).length,
  }));
}

/** The trim shown first: the one holding the backend's `default_unit_id`
 *  (else the first trim). */
export function defaultVersion(
  versions: readonly ModelVersion[],
  defaultUnitId?: string | null,
): ModelVersion | null {
  if (versions.length === 0) return null;
  return versions.find((v) => v.units.some((u) => u.id === defaultUnitId)) ?? versions[0];
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

/** Price block of a trim: «от N ฿ / сутки», its rental condition and the
 *  1-day price — all from the server (`card_prices`), rounded up to baht. */
export interface VersionPrice {
  /** Lowest per-day price, formatted («4 334»); null — on request. */
  from: string | null;
  /** 1-day (highest) per-day price; null when it equals `from` or is unknown. */
  maxDay: string | null;
  /** Shortest rental that gets `from` (the unit's `price_from_min_days`). */
  minDays: number | null;
}

export function versionPrice(unit: CatalogModelUnit): VersionPrice {
  const cp = unit.card_prices;
  if (cp) {
    const from = formatBahtCeil(cp.per_day_min);
    const max = formatBahtCeil(cp.per_day_max);
    return { from, maxDay: max !== from ? max : null, minDays: unit.price_from_min_days ?? null };
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
