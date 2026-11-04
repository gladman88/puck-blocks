import { pluralDays } from './dates';
import type { DeliveryCost } from './DeliveryAddressSection';
import { formatDayPrice, formatMoney, NBSP } from './price';

/** One rental line of `POST /catalog/price-quote/` — consecutive days at the
 *  same day rate. Money comes as decimal strings. */
export interface PriceQuoteLine {
  days: number;
  rate_per_day: string;
  amount: string;
}
export interface PriceQuoteAccessory {
  accessory_id: string;
  quantity: number;
  amount: string;
}
/** A complete quote (the rental is priced). An incomplete price matrix
 *  (`rental: null`) never reaches the UI — `parsePriceQuote` returns null. */
export interface PriceQuote {
  total_days: number;
  rental: { total: string; lines: PriceQuoteLine[] };
  accessories: PriceQuoteAccessory[];
  total: string;
}

function isMoney(v: unknown): v is string {
  return typeof v === 'string' && Number.isFinite(parseFloat(v));
}

/** Validate the ручка response. Anything unexpected (incl. `rental: null`) → null
 *  → no price block: a wrong number is worse than none. */
export function parsePriceQuote(j: unknown): PriceQuote | null {
  if (!j || typeof j !== 'object') return null;
  const o = j as Record<string, unknown>;
  const rental = o.rental as Record<string, unknown> | null | undefined;
  if (!rental || typeof rental !== 'object' || !isMoney(rental.total) || !Array.isArray(rental.lines)) return null;
  if (!isMoney(o.total)) return null;
  const lines: PriceQuoteLine[] = [];
  for (const l of rental.lines as unknown[]) {
    const r = l as Record<string, unknown> | null;
    if (!r || typeof r.days !== 'number' || !isMoney(r.rate_per_day) || !isMoney(r.amount)) return null;
    lines.push({ days: r.days, rate_per_day: r.rate_per_day, amount: r.amount });
  }
  if (lines.length === 0) return null;
  const accessories: PriceQuoteAccessory[] = [];
  for (const a of Array.isArray(o.accessories) ? (o.accessories as unknown[]) : []) {
    const r = a as Record<string, unknown> | null;
    if (!r || typeof r.accessory_id !== 'string' || typeof r.quantity !== 'number' || !isMoney(r.amount)) return null;
    accessories.push({ accessory_id: r.accessory_id, quantity: r.quantity, amount: r.amount });
  }
  return {
    total_days: typeof o.total_days === 'number' ? o.total_days : 0,
    rental: { total: rental.total, lines },
    accessories,
    total: o.total,
  };
}

/** Money → integer satang, so sums are exact (no 0.1 + 0.2 drift). */
export function toSatang(value: string | number): number {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return Math.round(n * 100);
}

export type AddressKind = 'pickup' | 'dropoff';

/** Delivery / collection state for the summary: the toggle, whether an address
 *  is picked, and its quote from `/catalog/delivery-quote/`. */
export interface PriceSummaryLeg {
  enabled: boolean;
  hasLocation: boolean;
  cost: DeliveryCost;
}

export interface PriceSummaryStrings {
  /** «Стоимость» — section heading. */
  title: string;
  /** «Аренда» — rental line prefix. */
  rental: string;
  /** «бесплатно» — a zero-priced accessory. */
  free: string;
  /** «Доставка по адресу». */
  delivery: string;
  /** «Заберём по адресу». */
  collection: string;
  /** «Укажите адрес» — link to the address field. */
  ask: string;
  /** «Итого». */
  total: string;
  /** Currency suffix, e.g. "฿". */
  currency: string;
}

interface PriceSummaryProps {
  quote: PriceQuote;
  /** accessory id → display name in the current locale. */
  accessoryNames: Record<string, string>;
  /** The selection changed and a new quote is on its way: the shown sums are
   *  for the previous selection — dimmed and marked busy, never passed off as current. */
  stale?: boolean;
  pickup: PriceSummaryLeg;
  dropoff: PriceSummaryLeg;
  locale: 'ru' | 'en';
  strings: PriceSummaryStrings;
  onAskAddress: (kind: AddressKind) => void;
  /** «Укажите адрес» is inert (the manual request is on its way). */
  askDisabled?: boolean;
}

type LegView = { kind: 'ask' } | { kind: 'priced'; satang: number } | null;

/** Show rules: toggle off → nothing; on without an address → «Укажите адрес»
 *  (not in the total); priced with a matched zone → a line in the total; still
 *  loading / no zone / failed → nothing. */
function legView(leg: PriceSummaryLeg): LegView {
  if (!leg.enabled) return null;
  if (!leg.hasLocation) return { kind: 'ask' };
  const c = leg.cost;
  if (c != null && c !== 'loading' && c.matched) return { kind: 'priced', satang: toSatang(c.price) };
  return null;
}

/**
 * «Итого» of the price block: the server quote plus every priced
 * delivery/collection leg, in satang. One function for the block and for the
 * success screen, so the two can never disagree.
 */
export function priceSummaryTotalSatang(quote: PriceQuote, pickup: PriceSummaryLeg, dropoff: PriceSummaryLeg): number {
  let total = toSatang(quote.total);
  for (const view of [legView(pickup), legView(dropoff)]) {
    if (view?.kind === 'priced') total += view.satang;
  }
  return total;
}

/** A sum of the price block: exact (up to satang), groups and the currency
 *  joined by non-breaking spaces, e.g. «41 345 ฿». */
export function formatSummaryAmount(satang: number, currency: string): string {
  return `${formatMoney(satang / 100)}${NBSP}${currency}`;
}

/**
 * Whether the «Стоимость» block is shown for this quote. A priced accessory we
 * cannot name would read as a bare «× 1» — then no block at all rather than an
 * unexplained line inside the total. One predicate for the block and for the
 * success screen's «Итого», so the total is never shown when the block was not.
 */
export function isPriceSummaryVisible(quote: PriceQuote | null | undefined, accessoryNames: Record<string, string>): quote is PriceQuote {
  if (!quote) return false;
  return quote.accessories.every((acc) => Boolean(accessoryNames[acc.accessory_id]));
}

/**
 * «Стоимость» on the «Как забронировать?» step and the manual form: the rental
 * (one line per day rate) and accessories exactly as the server will write the
 * request, plus the delivery/collection quotes. Pure — no fetching; the browser
 * only adds lines.
 */
export function PriceSummary({
  quote,
  accessoryNames,
  pickup,
  dropoff,
  locale,
  strings,
  onAskAddress,
  stale = false,
  askDisabled = false,
}: PriceSummaryProps) {
  if (!isPriceSummaryVisible(quote, accessoryNames)) return null;
  const pickupView = legView(pickup);
  const dropoffView = legView(dropoff);
  const totalSatang = priceSummaryTotalSatang(quote, pickup, dropoff);

  const amount = (satang: number) => formatSummaryAmount(satang, strings.currency);

  const legRow = (kind: AddressKind, label: string, view: LegView) => {
    if (!view) return null;
    return (
      <div className="sb-vd__sum-row" data-sum={kind}>
        <span className="sb-vd__sum-label">{label}</span>
        {view.kind === 'ask' ? (
          <button type="button" className="sb-vd__sum-ask" disabled={askDisabled} onClick={() => onAskAddress(kind)}>
            {strings.ask}
          </button>
        ) : (
          <span className="sb-vd__sum-value">{amount(view.satang)}</span>
        )}
      </div>
    );
  };

  return (
    <div className={`sb-vd__sum${stale ? ' is-stale' : ''}`} aria-busy={stale || undefined}>
      <span className="sb-vd__section-label">{strings.title}</span>
      <div className="sb-vd__sum-card">
        {quote.rental.lines.map((line, i) => (
          <div className="sb-vd__sum-row" data-sum="rental" key={`r${i}`}>
            <span className="sb-vd__sum-label">
              {strings.rental} · {pluralDays(line.days, locale)} × {formatDayPrice(parseFloat(line.rate_per_day))}
              {NBSP}
              {strings.currency}
            </span>
            <span className="sb-vd__sum-value">{amount(toSatang(line.amount))}</span>
          </div>
        ))}
        {quote.accessories.map((acc) => {
          const satang = toSatang(acc.amount);
          return (
            <div className="sb-vd__sum-row" data-sum="accessory" key={acc.accessory_id}>
              <span className="sb-vd__sum-label">
                {accessoryNames[acc.accessory_id]} × {acc.quantity}
              </span>
              <span className="sb-vd__sum-value">{satang === 0 ? strings.free : amount(satang)}</span>
            </div>
          );
        })}
        {legRow('pickup', strings.delivery, pickupView)}
        {legRow('dropoff', strings.collection, dropoffView)}
        <div className="sb-vd__sum-row sb-vd__sum-row--total" data-sum="total">
          <span className="sb-vd__sum-label">{strings.total}</span>
          <span className="sb-vd__sum-value">{amount(totalSatang)}</span>
        </div>
      </div>
    </div>
  );
}
