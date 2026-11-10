import { ContactIcon } from '../components/ContactIcon';
import { PageIcon } from './icons';
import { versionPrice } from './model';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';

/**
 * Bottom bar of a model page on phones (≤640px, styles.css): «от N ฿ / сутки»,
 * a round Telegram button and «Забронировать». Fixed to the bottom with the
 * safe-area inset; a spacer of the same height (also phone-only) keeps the end
 * of the page from hiding under it — nothing moves when it shows. Needs
 * `ModelPageProvider`.
 */
export function MobileBookingBar({ telegramUrl }: { telegramUrl?: string }) {
  const page = useModelPage();
  if (!page || !page.selected) return null;
  const { locale, today, model, selected, openBooking } = page;
  const t = PAGE_STRINGS[locale];
  const price = versionPrice(selected.unit, today, model);

  return (
    <>
      <div className="sb-mp-mbar-spacer" aria-hidden="true" />
      <div className="sb-mp-mbar">
        <div>
          {price.from ? (
            <>
              <span>{t.from} </span>
              <b>{`${price.from} ฿`}</b>
              <span> {t.perDay}</span>
            </>
          ) : (
            <span>{t.onRequest}</span>
          )}
        </div>
        {telegramUrl ? (
          <a
            className="sb-mp-mbar__tg"
            href={telegramUrl}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
          >
            <ContactIcon kind="telegram" className="sb-mp-ic" />
          </a>
        ) : null}
        <button type="button" className="sb-btn" onClick={openBooking}>
          <PageIcon name="calendar" />
          {t.book}
        </button>
      </div>
    </>
  );
}
