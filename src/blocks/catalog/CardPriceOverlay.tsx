import type { ReactNode } from 'react';
import type { CardPrices } from '../VehicleCatalog';
import { formatBahtCeil } from './price';

/**
 * Parts shared by the catalog card (`VehicleCard`) and the cover of the vehicle
 * window (`VehicleBookingModal`, «детали»): the name block and the bottom
 * overlay «status — per-day range» + 7/14/30-day sums. Classes are the card's
 * (`sb-vcard__*`); every size is `N * --sb-vcard-u`, which the card scales with
 * its width and the window pins to 1px. Prices come from the server
 * (`card_prices`) — no arithmetic here beyond rounding up to whole baht.
 */

export type CardStatusTone = 'available' | 'free' | 'busy';

/** A subset of `STRINGS` in VehicleCatalog.tsx (ru + en there). */
export interface CardPriceOverlayStrings {
  from: string;
  /** «฿/день» — unit of the from-price fallback (no `card_prices`). */
  perDayUnit: string;
  /** «в сутки» — caption of the per-day range. */
  perDay: string;
  onRequest: string;
  days: (n: number) => string;
}

export interface CardPriceOverlayProps {
  statusText: string;
  statusTone: CardStatusTone;
  prices: CardPrices | null;
  /** Fallback «от N ฿/день» when there are no `card_prices`. */
  minPricePerDay: number | null;
  strings: CardPriceOverlayStrings;
  /** Status and range fade out (the card's «copied» plate takes their row). */
  dimmed?: boolean;
  /** Rendered inside the status row (the card's «Ссылка скопирована» plate). */
  statusSlot?: ReactNode;
}

const STATUS_MOD: Record<CardStatusTone, string> = {
  available: ' sb-vcard__status--available',
  free: ' sb-vcard__status--free',
  busy: '',
};

/** Six-digit sums («126 000 ฿») get the narrower type to stay in the tile. */
const LONG_SUM = 100000;

export function CardPriceOverlay({
  statusText,
  statusTone,
  prices,
  minPricePerDay,
  strings: t,
  dimmed = false,
  statusSlot,
}: CardPriceOverlayProps) {
  const minDay = prices ? formatBahtCeil(prices.per_day_min) : '';
  const maxDay = prices ? formatBahtCeil(prices.per_day_max) : '';
  const discount = prices ? Math.round(prices.month_discount_pct) : 0;

  return (
    <div className="sb-vcard__over">
      <div className={`sb-vcard__st${dimmed ? ' is-copied' : ''}`}>
        <span className={`sb-vcard__status${STATUS_MOD[statusTone]}`}>
          <span className="sb-vcard__status-dot" aria-hidden />
          {statusText}
        </span>
        <span className="sb-vcard__range">
          {prices ? (
            <>
              <small>{t.perDay}</small>
              <b>
                {minDay === maxDay ? (
                  <span>{minDay}</span>
                ) : (
                  <>
                    <span>{minDay}</span> – {maxDay}
                  </>
                )}
                {'\u00a0฿'}
              </b>
            </>
          ) : minPricePerDay !== null ? (
            <b className="sb-vcard__from">
              <small>{t.from} </small>
              <span>{formatBahtCeil(minPricePerDay)}</span>
              <small> {t.perDayUnit}</small>
            </b>
          ) : (
            <b className="sb-vcard__from">
              <small>{t.onRequest}</small>
            </b>
          )}
        </span>
        {statusSlot}
      </div>
      {prices && prices.quotes.length > 0 ? (
        <div className="sb-vcard__tiles">
          {prices.quotes.map((q) => {
            const best = q.days === 30;
            const sum = Math.ceil(parseFloat(q.total) - 1e-9);
            return (
              <div key={q.days} className={`sb-vcard__tile${best ? ' sb-vcard__tile--best' : ''}`}>
                {best && discount > 0 ? <span className="sb-vcard__flag">{`−${discount}%`}</span> : null}
                <span className="sb-vcard__tile-days">{t.days(q.days)}</span>
                <span className={`sb-vcard__tile-sum${sum >= LONG_SUM ? ' sb-vcard__tile-sum--long' : ''}`}>
                  {`${formatBahtCeil(q.total)}\u00a0฿`}
                </span>
              </div>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}

/** Name + «год · категория» — top of the card photo and of the window cover. */
export function CardTitle({
  name,
  year,
  categoryName,
  stepTitle = false,
}: {
  name: string;
  year: number | null | undefined;
  categoryName: string | null;
  /** The window's «детали» step: the name is the step title that takes focus
   *  on a step change (VehicleBookingModal). */
  stepTitle?: boolean;
}) {
  return (
    <div className="sb-vcard__title">
      <h3
        className="sb-vcard__name"
        tabIndex={stepTitle ? -1 : undefined}
        data-step-title={stepTitle ? '' : undefined}
      >
        {name}
      </h3>
      {year || categoryName ? (
        <p className="sb-vcard__sub">
          {year ? <span>{year}</span> : null}
          {year && categoryName ? <i aria-hidden /> : null}
          {categoryName ? <span className="sb-vcard__cat">{categoryName}</span> : null}
        </p>
      ) : null}
    </div>
  );
}

export function ShareIcon() {
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

export function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  );
}
