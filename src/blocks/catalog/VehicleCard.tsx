import type { MouseEvent } from 'react';
import type { CatalogVehicle } from '../VehicleCatalog';
import { CardPriceOverlay, CardTitle, CalendarIcon, CheckIcon, ShareIcon } from './CardPriceOverlay';
import { shareVehicle } from './share';
import { useCopiedToast } from './useCopiedToast';

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
  /** «3 машины» / «3 байка» / «3 cars» / «3 bikes» — size of a model group
   *  with no free unit, worded by the vehicle type. */
  units: (n: number, kind?: CatalogVehicle['vehicle_type']) => string;
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
  /** Address of the model page. Set → the stretched open overlay is a link
   *  (search engines follow it, Ctrl/⌘/Shift/Alt/middle click open it in a new
   *  tab/window), while a plain click still opens the vehicle window (`onOpen`)
   *  in place. The "Book"/"Share" buttons stay outside the link.
   *  Absent → the overlay is a button (as before). */
  href?: string;
}

/** A click the browser should handle itself (new tab/window, download). */
function isModifiedClick(e: MouseEvent): boolean {
  return e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey;
}

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
  href,
}: VehicleCardProps) {
  const toast = useCopiedToast();

  // With `href` the stretched open overlay is a real link (crawlable, opens in
  // a new tab on Ctrl/⌘/Shift/Alt/middle click); a plain click still opens the
  // vehicle window in place. The card root stays an `<article>` so the
  // "Book"/"Share" buttons are siblings of the link, never nested inside it.
  const onLinkClick = (e: MouseEvent<HTMLAnchorElement>) => {
    if (e.defaultPrevented || isModifiedClick(e)) return;
    e.preventDefault();
    onOpen();
  };

  const handleShare = async () => {
    const outcome = await shareVehicle({
      vehicleId: v.id,
      title: v.display_name,
      referralCode,
      promptLabel: t.share,
    });
    // The grid may re-render (filters) while the share sheet / clipboard
    // answers — `show` is a no-op once this card is gone.
    if (outcome === 'copied') toast.show();
  };

  const countLabel =
    total > 1 ? (availableCount > 0 ? `${availableCount} ${t.available}` : t.units(total, v.vehicle_type)) : null;

  const statusText = v.is_available
    ? hasCompleteDateRange
      ? t.availableSelected
      : t.availableToday
    : v.free_from
      ? `${t.freeFrom} ${formatCardDate(v.free_from, locale)}`
      : t.busy;
  const statusTone = v.is_available ? 'available' : v.free_from ? 'free' : 'busy';
  const shown = toast.shown;

  return (
    <article className="sb-vcard">
      <div className="sb-vcard__inner">
        <div className="sb-vcard__ph">
          {v.photo_url ? <img src={v.photo_url} alt={v.display_name} loading="lazy" /> : null}
          {href ? (
            <a className="sb-vcard__open" href={href} aria-label={v.display_name} onClick={onLinkClick} />
          ) : (
            <button type="button" className="sb-vcard__open" aria-label={v.display_name} onClick={onOpen} />
          )}
          <div className="sb-vcard__top">
            <CardTitle name={v.display_name} year={v.year} categoryName={categoryName} />
            {countLabel ? <span className="sb-vcard__count">{countLabel}</span> : null}
          </div>
          <CardPriceOverlay
            statusText={statusText}
            statusTone={statusTone}
            prices={v.card_prices ?? null}
            minPricePerDay={v.min_price_per_day}
            strings={t}
            dimmed={shown}
            statusSlot={
              <div className="sb-vcard__toast-slot" role="status" aria-live="polite">
                {/* Always mounted (parked off the edge): adding `is-shown` to an
                    existing node is what lets the slide-in transition run. The
                    text is rendered only while visible, so the live region
                    announces it at that moment and not on mount. */}
                <span className={`sb-vcard__toast${shown ? ' is-shown' : ''}`} aria-hidden={toast.phase === 'hidden'}>
                  {toast.phase !== 'hidden' ? (
                    <>
                      <CheckIcon />
                      {t.linkCopied}
                    </>
                  ) : null}
                </span>
              </div>
            }
          />
        </div>
        <div className="sb-vcard__body">
          <button type="button" className="sb-vcard__book" onClick={onOpen}>
            <CalendarIcon />
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
