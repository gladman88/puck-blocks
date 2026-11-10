import { useMemo, useState } from 'react';
import { ContactIcon } from '../components/ContactIcon';
import { STRINGS as CATALOG_STRINGS, categoryLabel } from '../blocks/VehicleCatalog';
import { formatBahtCeil, formatMoney } from '../blocks/catalog/price';
import { buildSpecRows } from '../blocks/catalog/specs';
import { Breadcrumbs } from './Breadcrumbs';
import { IconBadge, PageIcon, type PageIconName } from './icons';
import { formatLongDate, trimLabel, versionPrice, versionSubtitle } from './model';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';
import type { CatalogModelUnit, Crumb } from './types';

/** Anchor of the hero — «Выбрать» of the trims scrolls back here. */
export const MODEL_HERO_ID = 'sb-model-hero';

export interface ModelHeroProps {
  /** Breadcrumbs above the hero (published links only — the host decides). */
  crumbs?: Crumb[];
  /** «Задать вопрос» links — from the site's contacts, not literals. */
  telegramUrl?: string;
  whatsappUrl?: string;
}

/** Icons of the trust row under the booking buttons (order of `PAGE_STRINGS.trust`). */
const TRUST_ICONS: PageIconName[] = ['truck', 'contract', 'chat'];

interface Slide {
  src: string;
  thumb: string;
}

function slidesOf(unit: CatalogModelUnit): Slide[] {
  const imgs = [...(unit.gallery_images ?? [])].sort((a, b) => a.position - b.position);
  const slides = imgs
    .map((g) => {
      const src = g.display_url ?? g.image_url;
      return src ? { src, thumb: g.thumb_url ?? src } : null;
    })
    .filter((s): s is Slide => s !== null);
  if (slides.length === 0 && unit.photo_url) slides.push({ src: unit.photo_url, thumb: unit.photo_url });
  return slides;
}

function Gallery({ unit, alt, locale }: { unit: CatalogModelUnit; alt: string; locale: 'ru' | 'en' }) {
  const t = PAGE_STRINGS[locale];
  const slides = useMemo(() => slidesOf(unit), [unit]);
  const [index, setIndex] = useState(0);
  const n = slides.length;
  const current = slides[Math.min(index, Math.max(0, n - 1))];
  const go = (step: number) => setIndex((i) => (i + step + n) % n);

  return (
    <div className="sb-mp-gal" aria-label={t.gallery}>
      <div className="sb-mp-gal__main">
        {current ? (
          <img
            key={current.src}
            src={current.src}
            alt={alt}
            {...(index === 0 ? { fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
          />
        ) : null}
        {n > 1 ? (
          <>
            <button type="button" className="sb-mp-gal__nav sb-mp-gal__nav--prev" aria-label={t.prevPhoto} onClick={() => go(-1)}>
              <PageIcon name="chevronLeft" />
            </button>
            <button type="button" className="sb-mp-gal__nav sb-mp-gal__nav--next" aria-label={t.nextPhoto} onClick={() => go(1)}>
              <PageIcon name="chevronRight" />
            </button>
            <span className="sb-mp-gal__count">{`${index + 1} / ${n}`}</span>
          </>
        ) : null}
      </div>
      {n > 1 ? (
        <div className="sb-mp-gal__thumbs">
          {slides.map((s, i) => (
            <button
              key={s.src}
              type="button"
              className={`sb-mp-thumb${i === index ? ' is-on' : ''}`}
              aria-label={t.photoN(i + 1)}
              aria-pressed={i === index}
              onClick={() => setIndex(i)}
            >
              <img src={s.thumb} alt="" loading="lazy" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** «Депозит 30 000 ฿ или 80 000 RUB · 1 000 USD» — THB first. */
function Deposit({ unit, locale }: { unit: CatalogModelUnit; locale: 'ru' | 'en' }) {
  const t = PAGE_STRINGS[locale];
  const list = [...(unit.deposits ?? [])]
    .filter((d) => formatMoney(d.amount))
    .sort((a, b) => Number(b.currency_code === 'THB') - Number(a.currency_code === 'THB'));
  if (list.length === 0) return null;
  const sum = (d: (typeof list)[number]) =>
    `${formatMoney(d.amount)} ${d.currency_code === 'THB' ? '฿' : d.currency_code}`;
  const [first, ...rest] = list;
  return (
    <p className="sb-mp-deposit">
      <PageIcon name="shield" />
      <span>{t.deposit}</span>
      <b>{sum(first)}</b>
      {rest.length > 0 ? <i>{`${t.or} ${rest.map(sum).join(' · ')}`}</i> : null}
    </p>
  );
}

/**
 * First screen of a model page (approved mockup): gallery on the left, the
 * booking card on the right — tags, h1, trim switcher, «from» price with its
 * rental condition, status, 7/14/30-day sums, deposit, «Забронировать» and
 * «Задать вопрос». Needs `ModelPageProvider`.
 */
export function ModelHero({ crumbs = [], telegramUrl, whatsappUrl }: ModelHeroProps) {
  const page = useModelPage();
  if (!page || !page.selected) return null;
  const { model, locale, today, versions, selected, select, openBooking } = page;
  const t = PAGE_STRINGS[locale];
  const c = CATALOG_STRINGS[locale];
  const unit = selected.unit;

  const rows = buildSpecRows(unit, locale);
  const tags = [
    model.category ? categoryLabel(model.category, locale) : null,
    rows.find((r) => r.key === 'fuel')?.value ?? null,
    rows.find((r) => r.key === 'body')?.value ?? null,
  ].filter((x): x is string => Boolean(x));

  const price = versionPrice(unit, today, model);
  const note = price.from ? t.priceNote(price.minDays, price.maxDay) : '';
  const available = selected.availableCount > 0;
  const statusText = available
    ? t.statusFree
    : unit.free_from
      ? t.statusFreesOn(formatLongDate(unit.free_from, locale))
      : c.busy;
  const statusMod = available ? '' : unit.free_from ? ' sb-mp-status--soon' : ' sb-mp-status--busy';
  const quotes = unit.card_prices?.quotes ?? [];
  const discount = Math.round(unit.card_prices?.month_discount_pct ?? 0);

  return (
    <section className="sb-section sb-mp-hero" id={MODEL_HERO_ID}>
      <div className="sb-container">
        <Breadcrumbs crumbs={crumbs} locale={locale} />
        <div className="sb-mp-hero__grid">
          <div className="sb-mp-hero__media">
            {/* Another trim — its own photos, from the first. */}
            <Gallery key={unit.id} unit={unit} alt={model.label} locale={locale} />
          </div>
          <div className="sb-mp-book">
            {tags.length > 0 ? (
              <p className="sb-mp-book__tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </p>
            ) : null}
            <h1 className="sb-mp-title">
              {model.label} <small>{t.rentInPhuket}</small>
            </h1>
            {versions.length > 1 ? (
              <div className="sb-mp-seg" style={{ ['--n' as string]: versions.length }} role="group" aria-label={t.trims}>
                {versions.map((v) => {
                  const sub = versionSubtitle(v, versions, t.seatsCount);
                  const on = v.key === selected.key;
                  return (
                    <button
                      key={v.key}
                      type="button"
                      className={on ? 'is-on' : undefined}
                      aria-pressed={on}
                      onClick={() => select(v.key)}
                    >
                      {trimLabel(v.trim, t.baseTrim)}
                      {sub ? <i>{sub}</i> : null}
                    </button>
                  );
                })}
              </div>
            ) : null}
            <div className="sb-mp-book__body">
              <div className="sb-mp-price-row">
                {price.from ? (
                  <p className="sb-mp-price">
                    <span className="sb-mp-price__from">{t.from}</span>
                    <b>{`${price.from} ฿`}</b>
                    <span className="sb-mp-price__unit">{t.perDay}</span>
                  </p>
                ) : (
                  <p className="sb-mp-price">
                    <span className="sb-mp-price__from">{t.onRequest}</span>
                  </p>
                )}
                <span className={`sb-mp-status${statusMod}`}>
                  <i aria-hidden="true" />
                  {statusText}
                </span>
              </div>
              {note ? <p className="sb-mp-price__note">{note}</p> : null}
              {quotes.length > 0 ? (
                <div className="sb-mp-tilerow">
                  {quotes.map((q) => {
                    const best = q.days === 30;
                    return (
                      <div key={q.days} className={`sb-mp-tile${best ? ' sb-mp-tile--best' : ''}`}>
                        {best && discount > 0 ? <em>{`−${discount}%`}</em> : null}
                        <span>{t.days(q.days)}</span>
                        <b>{`${formatBahtCeil(q.total)} ฿`}</b>
                      </div>
                    );
                  })}
                </div>
              ) : null}
              <Deposit unit={unit} locale={locale} />
            </div>
            <div className="sb-mp-actions">
              <button type="button" className="sb-btn sb-mp-cta" onClick={openBooking}>
                <PageIcon name="calendar" />
                {t.book}
              </button>
              {telegramUrl || whatsappUrl ? (
                <div className="sb-mp-ask">
                  <span>{t.ask}</span>
                  {telegramUrl ? (
                    <a className="sb-mp-btn-ghost" href={telegramUrl} target="_blank" rel="noopener noreferrer">
                      <ContactIcon kind="telegram" className="sb-mp-ic" />
                      Telegram
                    </a>
                  ) : null}
                  {whatsappUrl ? (
                    <a className="sb-mp-btn-ghost" href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <ContactIcon kind="whatsapp" className="sb-mp-ic" />
                      WhatsApp
                    </a>
                  ) : null}
                </div>
              ) : null}
            </div>
            <ul className="sb-mp-trust">
              {t.trust.map((label, i) => (
                <li key={label}>
                  <IconBadge name={TRUST_ICONS[i]} />
                  {label}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
