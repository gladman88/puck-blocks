import { useEffect, useRef, useState } from 'react';
import type { CatalogVehicle } from '../VehicleCatalog';
import { formatDayPrice } from './price';
import { shareVehicle } from './share';

/** Card strings — a subset of `STRINGS` in VehicleCatalog.tsx (ru + en there). */
export interface VehicleCardStrings {
  from: string;
  /** «฿/день» — unit of the from-price fallback (no `card_prices`). */
  perDayUnit: string;
  /** «в сутки» — caption of the per-day range. */
  perDay: string;
  onRequest: string;
  busy: string;
  freeFrom: string;
  availableToday: string;
  availableSelected: string;
  available: string;
  total: string;
  book: string;
  share: string;
  linkCopied: string;
  days: (n: number) => string;
}

export interface VehicleCardProps {
  vehicle: CatalogVehicle;
  /** Units of this model in the group / how many of them are free. */
  total: number;
  availableCount: number;
  /** Localized category name, or null where the card must not show it. */
  categoryName: string | null;
  /** Both dates of a rental window are picked (status «Свободно» vs «Свободно сегодня»). */
  hasCompleteDateRange: boolean;
  locale: 'ru' | 'en';
  strings: VehicleCardStrings;
  referralCode?: string | null;
  /** Opens the vehicle window (photo/name and «Забронировать»). */
  onOpen: () => void;
}

/** How long the «Ссылка скопирована» plate stays, and its slide time (CSS `--sb-vcard-anim`). */
export const SHARE_TOAST_MS = 2000;
const SHARE_TOAST_ANIM_MS = 220;

export function formatCardDate(iso: string, locale: 'ru' | 'en'): string {
  try {
    // timeZone: 'UTC' is load-bearing: `free_from` is a date-only string, which
    // ES parses as UTC midnight. Since the grid is server-rendered (SSR preload)
    // the server and the visitor's browser MUST format it identically, or a
    // visitor west of UTC gets a hydration mismatch (server «01 сент.», client
    // «31 авг.»). UTC renders the literal date exactly as the backend wrote it.
    return new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit',
      month: 'short',
      timeZone: 'UTC',
    });
  } catch {
    return iso;
  }
}

/** Tile sums in whole baht: a fractional day rate (month price / 30) gives
 *  «65 000.10», which overflows the tile and tells the customer nothing. */
function formatWholeSum(value: string): string {
  return Math.round(parseFloat(value)).toLocaleString('en-US').replace(/,/g, '\u00a0');
}

/** «12 600» — server sums shown as-is, groups split by a non-breaking space. */
function formatSum(value: string | number): string {
  const n = typeof value === 'number' ? value : parseFloat(value);
  return formatDayPrice(n).replace(/,/g, '\u00a0');
}

function ShareIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
    </svg>
  );
}

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/**
 * Catalog card (approved 2026-11-04): 4:5 photo with the name on top and
 * «status — per-day range» + 7/14/30-day sums at the bottom, then a strip with
 * «Забронировать» and «Поделиться». Every size scales with the card width
 * (container queries, `--sb-vcard-u` in styles.css). Prices come from the
 * server (`card_prices`) — no arithmetic here.
 */
export function VehicleCard({
  vehicle: v,
  total,
  availableCount,
  categoryName,
  hasCompleteDateRange,
  locale,
  strings: t,
  referralCode,
  onOpen,
}: VehicleCardProps) {
  // hidden → shown (slides in, 2 s) → leaving (slides out) → hidden.
  const mounted = useRef(true);
  const [toast, setToast] = useState<'hidden' | 'shown' | 'leaving'>('hidden');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(
    () => {
      mounted.current = true;
      return () => {
        mounted.current = false;
        timers.current.forEach(clearTimeout);
      };
    },
    [],
  );

  const handleShare = async () => {
    const outcome = await shareVehicle({
      vehicleId: v.id,
      title: v.display_name,
      referralCode,
      promptLabel: t.share,
    });
    // The grid may re-render (filters) while the share sheet / clipboard answers.
    if (outcome !== 'copied' || !mounted.current) return;
    timers.current.forEach(clearTimeout);
    setToast('shown');
    timers.current = [
      setTimeout(() => setToast('leaving'), SHARE_TOAST_MS),
      setTimeout(() => setToast('hidden'), SHARE_TOAST_MS + SHARE_TOAST_ANIM_MS),
    ];
  };

  const countLabel =
    total > 1 ? (availableCount > 0 ? `${availableCount} ${t.available}` : `${total} ${t.total}`) : null;

  const statusText = v.is_available
    ? hasCompleteDateRange
      ? t.availableSelected
      : t.availableToday
    : v.free_from
      ? `${t.freeFrom} ${formatCardDate(v.free_from, locale)}`
      : t.busy;
  const statusMod = v.is_available ? ' sb-vcard__status--available' : v.free_from ? ' sb-vcard__status--free' : '';

  const prices = v.card_prices ?? null;
  const minDay = prices ? formatSum(prices.per_day_min) : '';
  const maxDay = prices ? formatSum(prices.per_day_max) : '';
  const discount = prices ? Math.round(prices.month_discount_pct) : 0;
  const shown = toast === 'shown';

  return (
    <article className="sb-vcard">
      <div className="sb-vcard__inner">
        <div className="sb-vcard__ph">
          {v.photo_url ? <img src={v.photo_url} alt={v.display_name} loading="lazy" /> : null}
          <button type="button" className="sb-vcard__open" aria-label={v.display_name} onClick={onOpen} />
          <div className="sb-vcard__top">
            <div className="sb-vcard__title">
              <h3 className="sb-vcard__name">{v.display_name}</h3>
              {v.year || categoryName ? (
                <p className="sb-vcard__sub">
                  {v.year ? <span>{v.year}</span> : null}
                  {v.year && categoryName ? <i aria-hidden /> : null}
                  {categoryName ? <span className="sb-vcard__cat">{categoryName}</span> : null}
                </p>
              ) : null}
            </div>
            {countLabel ? <span className="sb-vcard__count">{countLabel}</span> : null}
          </div>
          <div className="sb-vcard__over">
            <div className={`sb-vcard__st${shown ? ' is-copied' : ''}`}>
              <span className={`sb-vcard__status${statusMod}`}>
                <span className="sb-vcard__status-dot" aria-hidden />
                {statusText}
              </span>
              <span
                className={`sb-vcard__range${
                  prices && (minDay.includes('.') || maxDay.includes('.')) ? ' sb-vcard__range--fraction' : ''
                }`}
              >
                {prices ? (
                  <>
                    <small>{t.perDay}</small>
                    <b>
                      {prices.per_day_min === prices.per_day_max ? (
                        <span>{minDay}</span>
                      ) : (
                        <>
                          <span>{minDay}</span> – {maxDay}
                        </>
                      )}
                      {' ฿'}
                    </b>
                  </>
                ) : v.min_price_per_day !== null ? (
                  <b className="sb-vcard__from">
                    <small>{t.from} </small>
                    <span>{formatDayPrice(v.min_price_per_day)}</span>
                    <small> {t.perDayUnit}</small>
                  </b>
                ) : (
                  <b className="sb-vcard__from">
                    <small>{t.onRequest}</small>
                  </b>
                )}
              </span>
              <div className="sb-vcard__toast-slot" role="status" aria-live="polite">
                {/* Always mounted (parked off the edge): adding `is-shown` to an
                    existing node is what lets the slide-in transition run. The
                    text is rendered only while visible, so the live region
                    announces it at that moment and not on mount. */}
                <span className={`sb-vcard__toast${shown ? ' is-shown' : ''}`} aria-hidden={toast === 'hidden'}>
                  {toast !== 'hidden' ? (
                    <>
                      <CheckIcon />
                      {t.linkCopied}
                    </>
                  ) : null}
                </span>
              </div>
            </div>
            {prices && prices.quotes.length > 0 ? (
              <div className="sb-vcard__tiles">
                {prices.quotes.map((q) => {
                  const best = q.days === 30;
                  const long = Math.round(parseFloat(q.total)) >= 100000;
                  return (
                    <div key={q.days} className={`sb-vcard__tile${best ? ' sb-vcard__tile--best' : ''}`}>
                      {best && discount > 0 ? <span className="sb-vcard__flag">{`−${discount}%`}</span> : null}
                      <span className="sb-vcard__tile-days">{t.days(q.days)}</span>
                      <span className={`sb-vcard__tile-sum${long ? ' sb-vcard__tile-sum--long' : ''}`}>
                        {`${formatWholeSum(q.total)} ฿`}
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : null}
          </div>
        </div>
        <div className="sb-vcard__body">
          <button type="button" className="sb-vcard__book" onClick={onOpen}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <rect x="3" y="4" width="18" height="18" rx="2" />
              <path d="M16 2v4M8 2v4M3 10h18" />
            </svg>
            {t.book}
          </button>
          <button
            type="button"
            className={`sb-vcard__share${shown ? ' is-done' : ''}`}
            aria-label={t.share}
            onClick={handleShare}
          >
            {shown ? <CheckIcon /> : <ShareIcon />}
          </button>
        </div>
      </div>
    </article>
  );
}
