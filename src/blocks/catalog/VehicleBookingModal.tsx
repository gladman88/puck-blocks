import { useEffect, useRef, useState, type FormEvent } from 'react';
import { createPortal } from 'react-dom';
import type { CatalogVehicle } from '../VehicleCatalog';
import { safeHref, safeImageUrl } from '../../sanitize';
import { buildTelegramDeepLink, money, nextDay, todayISO } from './dates';

interface GalleryImage {
  image_url: string;
  position: number;
}
interface Deposit {
  currency_code: string;
  amount: string;
}
interface PricingRow {
  period_label: string;
  min_days: number;
  max_days: number | null;
  price_per_day: number;
  is_monthly: boolean;
  monthly_price?: number;
}
export interface CatalogVehicleDetail extends CatalogVehicle {
  fuel_type?: string;
  transmission?: string;
  drive_type?: string;
  engine_volume?: string;
  horse_power?: string;
  sprint_0_100?: string;
  max_speed?: string;
  clearance?: string;
  weight?: string;
  tank_volume?: string;
  fuel_consumption?: string;
  options?: string[];
  advantages?: string[];
  insurance_class?: string;
  gallery_images?: GalleryImage[];
  deposits?: Deposit[];
  pricing_table?: PricingRow[];
  pricing_season_name?: string | null;
  pricing_spans_seasons?: boolean;
}

const SPEC_KEYS = [
  'fuel_type',
  'transmission',
  'drive_type',
  'engine_volume',
  'horse_power',
  'sprint_0_100',
  'max_speed',
  'clearance',
  'weight',
  'tank_volume',
  'fuel_consumption',
] as const;

const S = {
  ru: {
    close: 'Закрыть',
    from: 'от',
    perDay: '฿/день',
    available: 'Свободна сейчас',
    freesUp: 'Освободится',
    busy: 'Занята',
    specs: 'Характеристики',
    allSpecs: 'Все характеристики',
    options: 'Опции',
    deposit: 'Депозит',
    prices: 'Цены',
    perMonth: '฿/мес',
    spansSeasons: 'Цены показаны за текущий сезон',
    bookFrom: 'Забронировать с',
    loading: 'Загрузка…',
    error: 'Не удалось загрузить',
    start: 'Дата начала',
    end: 'Дата конца',
    name: 'Ваше имя',
    contact: 'Как с вами связаться?',
    send: 'Отправить заявку',
    tgQuick: 'Бронь в 1 клик через Telegram',
    tgQuickSub: 'Без форм — бот заполнит всё за вас',
    or: 'или',
    howToBook: 'Как забронировать?',
    back: 'Назад',
    successTitle: 'Заявка отправлена!',
    successText: 'Мы скоро свяжемся с вами.',
    tooMany: 'Слишком много запросов, попробуйте позже',
    sendErr: 'Не удалось отправить. Попробуйте ещё раз.',
    phonePh: '+66...',
    tgPh: '@username',
    labels: {
      fuel_type: 'Топливо',
      transmission: 'Коробка',
      drive_type: 'Привод',
      engine_volume: 'Двигатель',
      horse_power: 'Мощность',
      sprint_0_100: 'Разгон 0–100',
      max_speed: 'Макс. скорость',
      clearance: 'Клиренс',
      weight: 'Масса',
      tank_volume: 'Бак',
      fuel_consumption: 'Расход',
    } as Record<string, string>,
  },
  en: {
    close: 'Close',
    from: 'from',
    perDay: '฿/day',
    available: 'Available now',
    freesUp: 'Frees up',
    busy: 'Busy',
    specs: 'Specs',
    allSpecs: 'All specs',
    options: 'Options',
    deposit: 'Deposit',
    prices: 'Prices',
    perMonth: '฿/mo',
    spansSeasons: 'Prices shown for the current season',
    bookFrom: 'Book from',
    loading: 'Loading…',
    error: 'Failed to load',
    start: 'Start date',
    end: 'End date',
    name: 'Your name',
    contact: 'How to contact you?',
    send: 'Send request',
    tgQuick: '1-click booking via Telegram',
    tgQuickSub: 'No forms — the bot fills everything in for you',
    or: 'or',
    howToBook: 'How to book?',
    back: 'Back',
    successTitle: 'Request sent!',
    successText: 'We will contact you shortly.',
    tooMany: 'Too many requests, try later',
    sendErr: 'Could not send. Please try again.',
    phonePh: '+66...',
    tgPh: '@username',
    labels: {
      fuel_type: 'Fuel',
      transmission: 'Transmission',
      drive_type: 'Drive',
      engine_volume: 'Engine',
      horse_power: 'Power',
      sprint_0_100: '0–100',
      max_speed: 'Top speed',
      clearance: 'Clearance',
      weight: 'Weight',
      tank_volume: 'Tank',
      fuel_consumption: 'Consumption',
    } as Record<string, string>,
  },
} as const;

const HEADERS = { 'ngrok-skip-browser-warning': 'true' };

interface Props {
  vehicle: CatalogVehicle;
  apiBase: string;
  locale: 'ru' | 'en';
  botUsername: string;
  onClose: () => void;
}

/**
 * Vehicle detail + booking modal — mirrors frontend_catalog's flow, reusing the
 * SAME backend endpoints: GET /catalog/vehicles/{id}/ and
 * POST /catalog/booking-requests/. Rendered in a portal to document.body.
 */
export function VehicleBookingModal({ vehicle, apiBase, locale, botUsername, onClose }: Props) {
  const t = S[locale];
  const [detail, setDetail] = useState<CatalogVehicleDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gi, setGi] = useState(0);
  const [specsExpanded, setSpecsExpanded] = useState(false);

  const minStart =
    !vehicle.is_available && vehicle.free_from && vehicle.free_from > todayISO()
      ? vehicle.free_from
      : todayISO();
  const [start, setStart] = useState(minStart);
  const [end, setEnd] = useState(nextDay(minStart));
  const [name, setName] = useState('');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>('whatsapp');
  const [contact, setContact] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'detail' | 'book' | 'success'>('detail');
  const [err, setErr] = useState('');
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    fetch(`${apiBase}/api/v1/catalog/vehicles/${vehicle.id}/`, { headers: HEADERS })
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<CatalogVehicleDetail>;
      })
      .then((d) => {
        if (!cancelled) {
          setDetail(d);
          setState('ready');
        }
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicle.id]);

  // Keep end strictly after start.
  useEffect(() => {
    if (start && (!end || end <= start)) setEnd(nextDay(start));
  }, [start, end]);

  const datesValid = Boolean(start && end && start >= minStart && end > start);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!datesValid || !name.trim() || !contact.trim()) return;
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-requests/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...HEADERS },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
          customer_name: name.trim(),
          contact_channel: channel,
          contact_identifier: contact.trim(),
        }),
      });
      if (res.ok) {
        setStage('success');
      } else {
        setErr(res.status === 429 ? t.tooMany : t.sendErr);
      }
    } catch {
      setErr(t.sendErr);
    } finally {
      setSubmitting(false);
    }
  };

  const d = detail;
  const images = (d?.gallery_images ?? [])
    .map((g) => safeImageUrl(g.image_url))
    .filter((u): u is string => Boolean(u));
  const mainImg = images[gi] || safeImageUrl(vehicle.photo_url ?? '') || '';
  const tgHref = safeHref(
    buildTelegramDeepLink(botUsername, vehicle.id, datesValid ? { from: start, to: end } : undefined),
  );
  const price = d?.min_price_per_day ?? vehicle.min_price_per_day;

  return createPortal(
    // Wrap in .sb-root so the design tokens (--sb-*) cascade into the portal,
    // which lives outside the page's .sb-root.
    <div className="sb-root">
    <div className="sb-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="sb-modal__dialog" ref={dialogRef} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="sb-modal__close" aria-label={t.close} onClick={onClose}>
          ×
        </button>

        {state === 'loading' ? <p className="sb-modal__state">{t.loading}</p> : null}
        {state === 'error' ? <p className="sb-modal__state">{t.error}</p> : null}

        {state === 'ready' && d ? (
          stage === 'success' ? (
            <div className="sb-modal__success">
              <div className="sb-modal__check" aria-hidden>
                ✓
              </div>
              <h3>{t.successTitle}</h3>
              <p>{t.successText}</p>
              <button type="button" className="sb-btn" onClick={onClose}>
                OK
              </button>
            </div>
          ) : stage === 'detail' ? (
            <div className="sb-modal__body">
              {/* Gallery */}
              {mainImg ? (
                <div className="sb-vd__media">
                  <div className="sb-vd__frame">
                    <img className="sb-vd__photo" src={mainImg} alt={d.display_name} />
                    {images.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="sb-vd__nav sb-vd__nav--prev"
                          aria-label="‹"
                          onClick={() => setGi((i) => (i - 1 + images.length) % images.length)}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="sb-vd__nav sb-vd__nav--next"
                          aria-label="›"
                          onClick={() => setGi((i) => (i + 1) % images.length)}
                        >
                          ›
                        </button>
                        <span className="sb-vd__counter">
                          {gi + 1}/{images.length}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {images.length > 1 ? (
                    <div className="sb-vd__thumbs">
                      {images.map((u, i) => (
                        <button
                          type="button"
                          key={i}
                          className={`sb-vd__thumb ${i === gi ? 'is-active' : ''}`}
                          onClick={() => setGi(i)}
                          aria-label={`${i + 1}`}
                        >
                          <img src={u} alt="" loading="lazy" />
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              ) : null}

              <div className="sb-vd__info">
                <h3 className="sb-vd__name">
                  {d.display_name}
                  {d.year ? <span className="sb-vd__year"> {d.year}</span> : null}
                </h3>
                {d.category ? (
                  <span className="sb-vd__badge" style={{ backgroundColor: d.category.color }}>
                    {d.category.name}
                  </span>
                ) : null}

                {price != null ? (
                  <p className="sb-vd__price">
                    <small>{t.from} </small>
                    {Math.round(price).toLocaleString('en-US')}
                    <small> {t.perDay}</small>
                  </p>
                ) : null}

                <div className={`sb-vd__avail ${d.is_available ? 'is-free' : 'is-busy'}`}>
                  <span className="sb-vd__avail-dot" aria-hidden />
                  <span className="sb-vd__avail-text">
                    {d.is_available
                      ? t.available
                      : d.free_from
                        ? `${t.freesUp}: ${d.free_from}`
                        : t.busy}
                  </span>
                  {!d.is_available && d.free_from && d.free_from !== start ? (
                    <button
                      type="button"
                      className="sb-vd__avail-btn"
                      onClick={() => {
                        const from = d.free_from!;
                        setStart(from);
                        if (end <= from) setEnd(nextDay(from));
                      }}
                    >
                      {t.bookFrom} {d.free_from}
                    </button>
                  ) : null}
                </div>

                {(d.advantages ?? []).length > 0 ? (
                  <div className="sb-vd__chips">
                    {d.advantages!.map((a, i) => (
                      <span className="sb-chip" key={i}>
                        {a}
                      </span>
                    ))}
                  </div>
                ) : null}

                {/* Prices per rental period */}
                {(d.pricing_table ?? []).length > 0 ? (
                  <div className="sb-vd__prices">
                    <div className="sb-vd__prices-head">
                      <span className="sb-vd__section-label">{t.prices}</span>
                      {d.pricing_season_name ? (
                        <span className="sb-vd__season">· {d.pricing_season_name}</span>
                      ) : null}
                    </div>
                    <div className="sb-vd__prices-grid">
                      {d.pricing_table!.map((row, i) => (
                        <div className="sb-vd__price-row" key={i}>
                          <span className="sb-vd__price-period">{row.period_label}</span>
                          <span className="sb-vd__price-value">
                            {row.is_monthly && row.monthly_price != null ? (
                              <>
                                {money(row.monthly_price)}
                                <small> {t.perMonth}</small>
                              </>
                            ) : (
                              <>
                                {money(row.price_per_day)}
                                <small> {t.perDay}</small>
                              </>
                            )}
                          </span>
                        </div>
                      ))}
                    </div>
                    {d.pricing_spans_seasons ? (
                      <p className="sb-vd__season-note">{t.spansSeasons}</p>
                    ) : null}
                  </div>
                ) : null}

                {(d.deposits ?? []).length > 0 ? (
                  <div className="sb-vd__deposits">
                    <span className="sb-vd__section-label">{t.deposit}</span>
                    <div className="sb-vd__deposit-pills">
                      {d.deposits!.map((dep, i) => (
                        <span className="sb-vd__deposit-pill" key={i}>
                          {money(dep.amount)} {dep.currency_code}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : null}

                {/* Specs — first 4, rest behind a toggle (matches the standalone) */}
                {SPEC_KEYS.some((k) => d[k])
                  ? (() => {
                      const present = SPEC_KEYS.filter((k) => d[k]);
                      const visible = specsExpanded ? present : present.slice(0, 4);
                      return (
                        <div className="sb-vd__specs-wrap">
                          <div className="sb-vd__specs">
                            {visible.map((k) => (
                              <div className="sb-vd__spec" key={k}>
                                <span>{t.labels[k]}</span>
                                <b>{d[k]}</b>
                              </div>
                            ))}
                          </div>
                          {present.length > 4 ? (
                            <button
                              type="button"
                              className="sb-vd__specs-toggle"
                              onClick={() => setSpecsExpanded((v) => !v)}
                            >
                              {t.allSpecs} {specsExpanded ? '▲' : '▼'}
                            </button>
                          ) : null}
                        </div>
                      );
                    })()
                  : null}

                {(d.options ?? []).length > 0 ? (
                  <div className="sb-vd__chips">
                    {d.options!.map((o, i) => (
                      <span className="sb-chip sb-chip--ghost" key={i}>
                        {o}
                      </span>
                    ))}
                  </div>
                ) : null}
              </div>

              <div className="sb-vd__cta">
                {price != null ? (
                  <span className="sb-vd__cta-price">
                    <small>{t.from} </small>
                    {Math.round(price).toLocaleString('en-US')}
                    <small> {t.perDay}</small>
                  </span>
                ) : null}
                <button
                  type="button"
                  className="sb-btn sb-vd__cta-btn"
                  onClick={() => setStage('book')}
                >
                  {t.howToBook}
                </button>
              </div>
            </div>
          ) : (
            <div className="sb-modal__body sb-modal__body--book">
              <button type="button" className="sb-vd__back" onClick={() => setStage('detail')}>
                ‹ {t.back}
              </button>
              <div className="sb-bk__vehicle">
                {mainImg ? <img className="sb-bk__photo" src={mainImg} alt="" /> : null}
                <div className="sb-bk__meta">
                  <p className="sb-bk__name">{d.display_name}</p>
                  {price != null ? (
                    <p className="sb-bk__price">
                      <small>{t.from} </small>
                      {Math.round(price).toLocaleString('en-US')}
                      <small> {t.perDay}</small>
                    </p>
                  ) : null}
                </div>
              </div>
              <h3 className="sb-bk__title">{t.howToBook}</h3>

              {/* Booking */}
              <form className="sb-vd__book" onSubmit={submit}>
                <div className="sb-vd__dates">
                  <label>
                    {t.start}
                    <input
                      type="date"
                      className="sb-input"
                      value={start}
                      min={minStart}
                      onChange={(e) => setStart(e.target.value)}
                    />
                  </label>
                  <label>
                    {t.end}
                    <input
                      type="date"
                      className="sb-input"
                      value={end}
                      min={nextDay(start)}
                      onChange={(e) => setEnd(e.target.value)}
                    />
                  </label>
                </div>

                {tgHref ? (
                  <a
                    className="sb-vd__tg-card"
                    href={tgHref}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="sb-vd__tg-icon" aria-hidden>
                      ✈
                    </span>
                    <span className="sb-vd__tg-text">
                      <span className="sb-vd__tg-title">{t.tgQuick}</span>
                      <span className="sb-vd__tg-sub">{t.tgQuickSub}</span>
                    </span>
                    <span className="sb-vd__tg-arrow" aria-hidden>
                      ›
                    </span>
                  </a>
                ) : null}

                <div className="sb-vd__or">{t.or}</div>

                <input
                  className="sb-input"
                  type="text"
                  placeholder={t.name}
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
                <div className="sb-vd__channel" role="group" aria-label={t.contact}>
                  <button
                    type="button"
                    className={channel === 'whatsapp' ? 'is-active' : ''}
                    onClick={() => setChannel('whatsapp')}
                  >
                    WhatsApp
                  </button>
                  <button
                    type="button"
                    className={channel === 'telegram' ? 'is-active' : ''}
                    onClick={() => setChannel('telegram')}
                  >
                    Telegram
                  </button>
                </div>
                <input
                  className="sb-input"
                  type="text"
                  placeholder={channel === 'whatsapp' ? t.phonePh : t.tgPh}
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                />
                <button
                  className="sb-btn sb-btn--block"
                  type="submit"
                  disabled={submitting || !datesValid}
                >
                  {t.send}
                </button>
                {err ? <p className="sb-form__status sb-form__status--err">{err}</p> : null}
              </form>
            </div>
          )
        ) : null}
      </div>
    </div>
    </div>,
    document.body,
  );
}
