import { useEffect, useRef, useState, type FormEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { categoryLabel, type CatalogVehicle } from '../VehicleCatalog';
import { safeHref, safeImageUrl } from '../../sanitize';
import { formatShortDate, money, nextDay, todayISO } from './dates';
import { DeliveryAddressSection, type PickedLocation } from './DeliveryAddressSection';

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
// One sellable accessory item, and its category group (Stage 5,
// plans/paid-accessories/IMPLEMENTATION_PLAN.md §6) — mirrors
// frontend_catalog's CatalogAccessoryItem/CatalogAccessoryCategory. `id: null`
// on a group is the "Без категории"/"Other" fallback bucket, localized
// server-side. available_stock is null = not asked (no date window yet) or
// untracked — never treat null as "unavailable".
interface CatalogAccessoryItem {
  id: string;
  name_ru: string;
  name_en: string;
  photo_url: string | null;
  /** Optional client-facing text — shown as a caption banner in the
   *  fullscreen photo preview. Always a string, '' when not set. */
  description: string;
  price: number | null;
  price_unit: 'per_booking' | 'per_day';
  stock: number | null;
  available_stock: number | null;
}
interface CatalogAccessoryGroup {
  id: string | null;
  name_ru: string;
  name_en: string;
  photo_url: string | null;
  items: CatalogAccessoryItem[];
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
  accessories?: CatalogAccessoryGroup[];
}

// Order mirrors the standalone catalog: engine → power → fuel → transmission →
// drive are the first 4 (key specs), the rest collapse behind «Все характеристики».
const SPEC_KEYS = [
  'engine_volume',
  'horse_power',
  'fuel_type',
  'transmission',
  'drive_type',
  'sprint_0_100',
  'max_speed',
  'clearance',
  'weight',
  'tank_volume',
  'fuel_consumption',
] as const;

// fuel_type / transmission / drive_type come from the API as raw enums
// ("electric", "automatic", "fwd"); localise them like the standalone does.
const TRANSLATED_SPEC_KEYS = new Set(['fuel_type', 'transmission', 'drive_type']);
const SPEC_VALUE_LABELS: Record<'ru' | 'en', Record<string, string>> = {
  ru: {
    automatic: 'Автомат', manual: 'Механика', cvt: 'Вариатор', robot: 'Робот',
    petrol: 'Бензин', diesel: 'Дизель', electric: 'Электро', hybrid: 'Гибрид',
    fwd: 'Передний', rwd: 'Задний', awd: 'Полный',
  },
  en: {
    automatic: 'Automatic', manual: 'Manual', cvt: 'CVT', robot: 'Robot',
    petrol: 'Petrol', diesel: 'Diesel', electric: 'Electric', hybrid: 'Hybrid',
    fwd: 'FWD', rwd: 'RWD', awd: 'AWD',
  },
};

const S = {
  ru: {
    close: 'Закрыть',
    closePhoto: 'Закрыть фото',
    share: 'Поделиться',
    copied: 'Ссылка скопирована',
    from: 'от',
    perDay: '/день',
    priceUnit: 'THB',
    available: 'Свободна сейчас',
    freesUp: 'Освободится',
    busy: 'Занята',
    specs: 'Характеристики',
    allSpecs: 'Все характеристики',
    equipment: 'Комплектация',
    accessories: 'Дополнительные опции',
    perBooking: 'за бронь',
    accUnavailable: 'Недоступно на эти даты',
    deposit: 'Депозит',
    prices: 'Цены',
    day: 'день',
    days: 'дней',
    month: 'мес',
    spansSeasons: 'Цены показаны за текущий сезон',
    bookFrom: 'Забронировать с',
    loading: 'Загрузка…',
    error: 'Не удалось загрузить',
    name: 'Ваше имя',
    send: 'Отправить запрос',
    tgQuick: 'Бронь в 1 клик через Telegram',
    tgQuickSub: 'Без форм — бот заполнит всё за вас',
    or: 'или',
    howToBook: 'Как забронировать?',
    back: 'Назад',
    bookCta: 'Забронировать',
    formTitle: 'Запрос на бронирование',
    manual: 'Заполнить вручную',
    manualSub: 'Имя и контакт — займёт 30 секунд',
    dateGet: 'Дата получения',
    dateReturn: 'Дата возврата',
    contactWay: 'Способ связи',
    phoneLabel: 'Номер телефона',
    successTitle: 'Заявка отправлена!',
    successText: 'Мы скоро свяжемся с вами.',
    tooMany: 'Слишком много запросов, попробуйте позже',
    sendErr: 'Не удалось отправить. Попробуйте ещё раз.',
    phonePh: '+66...',
    tgPh: '@username',
    deliveryTitle: 'Доставка',
    deliveryPickup: 'Доставить машину по адресу',
    deliveryDropoff: 'Заберём машину по адресу',
    deliveryUnavailable: 'Поиск адреса временно недоступен',
    deliveryShowMap: 'Выбрать на карте',
    deliveryHideMap: 'Скрыть карту',
    deliveryMapHint: 'Нажмите на карту, чтобы выбрать точку',
    deliverySameAsPickup: 'Такой же адрес, как для доставки',
    labels: {
      fuel_type: 'Топливо',
      transmission: 'КПП',
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
    closePhoto: 'Close photo',
    share: 'Share',
    copied: 'Link copied',
    from: 'from',
    perDay: '/day',
    priceUnit: 'THB',
    available: 'Available now',
    freesUp: 'Frees up',
    busy: 'Busy',
    specs: 'Specs',
    allSpecs: 'All specs',
    equipment: 'Equipment',
    accessories: 'Additional Options',
    perBooking: 'per booking',
    accUnavailable: 'Not available for these dates',
    deposit: 'Deposit',
    prices: 'Prices',
    day: 'day',
    days: 'days',
    month: 'month',
    spansSeasons: 'Prices shown for the current season',
    bookFrom: 'Book from',
    loading: 'Loading…',
    error: 'Failed to load',
    name: 'Your name',
    send: 'Send request',
    tgQuick: '1-click booking via Telegram',
    tgQuickSub: 'No forms — the bot fills everything in for you',
    or: 'or',
    howToBook: 'How to book?',
    back: 'Back',
    bookCta: 'Book',
    formTitle: 'Booking request',
    manual: 'Fill in manually',
    manualSub: 'Name and contact — takes 30 seconds',
    dateGet: 'Pick-up date',
    dateReturn: 'Return date',
    contactWay: 'Contact method',
    phoneLabel: 'Phone number',
    successTitle: 'Request sent!',
    successText: 'We will contact you shortly.',
    tooMany: 'Too many requests, try later',
    sendErr: 'Could not send. Please try again.',
    phonePh: '+66...',
    tgPh: '@username',
    deliveryTitle: 'Delivery',
    deliveryPickup: 'Deliver the vehicle to my address',
    deliveryDropoff: "We'll pick it up from my address",
    deliveryUnavailable: 'Address search is temporarily unavailable',
    deliveryShowMap: 'Pick on the map',
    deliveryHideMap: 'Hide map',
    deliveryMapHint: 'Tap the map to choose a point',
    deliverySameAsPickup: 'Same address as delivery',
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

/** Telegram Mini App user, forwarded by the HOST app from its own
 *  `window.Telegram.WebApp.initData` — this component never reads
 *  `window.Telegram` itself (see VehicleCatalogProps.telegramUser). */
export interface TelegramCatalogUser {
  user_id: number;
  username?: string;
  first_name?: string;
  language_code?: string;
}

interface Props {
  vehicle: CatalogVehicle;
  apiBase: string;
  locale: 'ru' | 'en';
  botUsername: string;
  /** Google Maps JS API key for the delivery-address picker (Stage 6, plan
   *  §Stage 6). Undefined/empty → the picker degrades to an "unavailable"
   *  message; see VehicleCatalog's default (reads
   *  NEXT_PUBLIC_GOOGLE_MAPS_API_KEY at the host's build time). */
  googleMapsApiKey?: string;
  /** Agent/referral attribution code (`?ref=`) — captured by the HOST app
   *  (see VehicleCatalogProps.referralCode). Threaded into the booking
   *  payload, the Telegram deep link, and the share link. */
  referralCode?: string | null;
  /** Telegram Mini App user — prefills name/contact and is echoed into the
   *  booking payload as `telegram_user_data` (parity with frontend_catalog's
   *  BookingForm). */
  telegramUser?: TelegramCatalogUser | null;
  onClose: () => void;
}

/**
 * Vehicle detail + booking modal — mirrors frontend_catalog's flow, reusing the
 * SAME backend endpoints: GET /catalog/vehicles/{id}/ and
 * POST /catalog/booking-requests/. Rendered in a portal to document.body.
 */
export function VehicleBookingModal({
  vehicle,
  apiBase,
  locale,
  botUsername,
  googleMapsApiKey,
  referralCode,
  telegramUser,
  onClose,
}: Props) {
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
  // Prefill from the Telegram Mini App user, if the host passed one (parity
  // with frontend_catalog's BookingForm — name/channel/contact are just a
  // starting point, still editable).
  const [name, setName] = useState(telegramUser?.first_name || '');
  const [channel, setChannel] = useState<'whatsapp' | 'telegram'>(telegramUser ? 'telegram' : 'whatsapp');
  const [contact, setContact] = useState(telegramUser?.username ? `@${telegramUser.username}` : '');
  // accessory id -> quantity, picked on the detail screen (Stage 5, plan §6).
  const [accessories, setAccessories] = useState<Record<string, number>>({});
  // Fullscreen accessory-photo preview (Stage 5.5, design review 2026-07-16)
  // — null = closed. No lightbox library exists in puck-blocks (framework-
  // neutral, no heavy deps), so this is a small custom one, portalled above
  // the booking modal itself (see the render at the bottom of this component).
  const [accessoryLightbox, setAccessoryLightbox] = useState<
    { photoUrl: string; description: string; name: string } | null
  >(null);
  // Delivery/collection by address (Stage 6, plan §Stage 6) — "enabled" and
  // "location picked" are separate: the toggle reveals the picker, but nothing
  // is submitted until a real Places selection lands (see DeliveryAddressSection).
  const [pickupEnabled, setPickupEnabled] = useState(false);
  const [dropoffEnabled, setDropoffEnabled] = useState(false);
  const [pickupLocation, setPickupLocation] = useState<PickedLocation | null>(null);
  const [dropoffLocation, setDropoffLocation] = useState<PickedLocation | null>(null);
  // Collection reuses the delivery address ("Такой же адрес") — default ON so a
  // round-trip rental isn't entered twice; only takes effect when delivery is
  // on with a picked address (see effectiveDropoffLocation below).
  const [dropoffSameAsPickup, setDropoffSameAsPickup] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [stage, setStage] = useState<'detail' | 'choice' | 'form' | 'success'>('detail');
  const [err, setErr] = useState('');
  // 1-click Telegram booking (plans/catalog-telegram-booking-intent/) — POSTs
  // the current selection to /booking-intents/, then redirects to the bot
  // with the returned token. Separate loading/error state from the manual
  // form's (submitting/err) since they're two independent flows on the same
  // "choice" screen.
  const [tgSubmitting, setTgSubmitting] = useState(false);
  const [tgErr, setTgErr] = useState('');
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // «Поделиться» — a deep link (`?vehicle=<id>` on the current page/locale) that
  // reopens this card. Native share sheet (mobile) → clipboard → prompt fallback.
  const handleShare = async () => {
    const url = new URL(window.location.href);
    url.searchParams.set('vehicle', vehicle.id);
    // Preserve agent attribution across a re-share (parity with the standalone
    // catalog's VehicleDetail — a forwarded link must keep crediting the agent).
    if (referralCode) url.searchParams.set('ref', referralCode);
    const shareUrl = url.toString();
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({ title: vehicle.display_name, url: shareUrl });
      } catch {
        /* user dismissed the share sheet — no-op */
      }
      return;
    }
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt(t.share, shareUrl);
    }
  };

  // Mobile bottom-sheet drag-to-dismiss (mirrors frontend_catalog's ResponsiveDialog).
  // The grabber strip is mobile-only (CSS `display:none` ≥640px), so on desktop
  // these handlers have no target and never fire. `touch-action:none` on the
  // grabber stops the body from scrolling while dragging.
  const SHEET_DISMISS_PX = 120;
  const dragStartY = useRef(0);
  const dragging = useRef(false);
  const dragOffsetRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [dragSmooth, setDragSmooth] = useState(false);

  const onGrabStart = (e: ReactTouchEvent<HTMLDivElement>) => {
    dragging.current = true;
    dragStartY.current = e.touches[0].clientY;
    dragOffsetRef.current = 0;
    setDragSmooth(false);
  };
  const onGrabMove = (e: ReactTouchEvent<HTMLDivElement>) => {
    if (!dragging.current) return;
    const dy = Math.max(0, e.touches[0].clientY - dragStartY.current);
    dragOffsetRef.current = dy;
    setDragY(dy);
  };
  const onGrabEnd = () => {
    if (!dragging.current) return;
    dragging.current = false;
    setDragSmooth(true);
    if (dragOffsetRef.current > SHEET_DISMISS_PX) {
      setDragY(typeof window !== 'undefined' ? window.innerHeight : 800);
      setTimeout(onClose, 240);
    } else {
      setDragY(0);
      setTimeout(() => setDragSmooth(false), 300);
    }
  };

  // Gallery is a native horizontal scroll-snap carousel: the finger drags the
  // photo smoothly and it snaps to the nearest one — best-practice touch UX, no
  // custom drag math. onScroll syncs the counter / active thumb; the arrows and
  // thumbnails scroll the track (which then syncs `gi` back via onScroll).
  const trackRef = useRef<HTMLDivElement>(null);
  const onTrackScroll = () => {
    const el = trackRef.current;
    if (!el || !el.clientWidth) return;
    const i = Math.round(el.scrollLeft / el.clientWidth);
    setGi((cur) => (i >= 0 && i !== cur ? i : cur));
  };
  const scrollToImage = (i: number, count: number) => {
    const el = trackRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(count - 1, i));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: 'smooth' });
  };

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setAccessories({}); // new vehicle → discard any stale selection (defensive: the
    // component isn't guaranteed to remount between vehicles, see VehicleCatalog.tsx)
    setAccessoryLightbox(null); // same reason — an open photo preview from the
    // previous vehicle must not linger over the new one (code review 2026-07-16)
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

  // Shared by both booking paths (manual form + 1-click Telegram) — the
  // catalog-picked accessory selection in the {accessory_id, quantity} shape
  // both /booking-requests/ and /booking-intents/ accept.
  const selectedAccessories = Object.entries(accessories)
    .filter(([, qty]) => qty > 0)
    .map(([accessory_id, quantity]) => ({ accessory_id, quantity }));

  // Effective delivery/collection locations shared by both booking paths.
  // Collection mirrors delivery when "same address" is on (and delivery has a
  // picked address) — so the round-trip case is submitted without entering the
  // address twice.
  const effectivePickupLocation = pickupEnabled ? pickupLocation : null;
  const effectiveDropoffLocation = dropoffEnabled
    ? dropoffSameAsPickup && pickupEnabled && pickupLocation
      ? pickupLocation
      : dropoffLocation
    : null;

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submitting || !datesValid || !name.trim() || !contact.trim()) return;
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
          ...(referralCode ? { referral_code: referralCode } : {}),
          ...(telegramUser?.user_id
            ? {
                telegram_user_data: {
                  user_id: telegramUser.user_id,
                  username: telegramUser.username,
                  first_name: telegramUser.first_name,
                },
              }
            : {}),
          ...(selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {}),
          ...(effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {}),
          ...(effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}),
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

  // 1-click Telegram booking (plans/catalog-telegram-booking-intent/):
  // Telegram's /start payload caps at 64 chars, far too small to carry
  // accessories/delivery addresses directly — so the current selection is
  // POSTed to a booking-intent first, and only the returned token travels in
  // the deep link. The bot resolves it back into the full selection.
  const handleTelegramBooking = async () => {
    if (tgSubmitting || !datesValid) return;
    setTgSubmitting(true);
    setTgErr('');
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-intents/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...HEADERS },
        body: JSON.stringify({
          vehicle_id: vehicle.id,
          start_date: start,
          end_date: end,
          ...(referralCode ? { referral_code: referralCode } : {}),
          ...(selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {}),
          ...(effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {}),
          ...(effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}),
        }),
      });
      if (!res.ok) {
        setTgErr(res.status === 429 ? t.tooMany : t.sendErr);
        return;
      }
      // Guard the token explicitly rather than trusting the response shape —
      // a malformed/partial 2xx body must show a retryable error, not
      // silently navigate to a broken `bk_undefined` deep link.
      const { token } = (await res.json()) as { token?: string };
      if (!token) {
        setTgErr(t.sendErr);
        return;
      }
      const href = safeHref(`https://t.me/${botUsername}?start=bk_${encodeURIComponent(token)}`);
      if (!href) {
        setTgErr(t.sendErr);
        return;
      }
      window.location.href = href;
    } catch {
      setTgErr(t.sendErr);
    } finally {
      setTgSubmitting(false);
    }
  };

  const d = detail;
  const galleryUrls = (d?.gallery_images ?? [])
    .map((g) => safeImageUrl(g.image_url))
    .filter((u): u is string => Boolean(u));
  const fallbackImg = safeImageUrl(vehicle.photo_url ?? '') || '';
  const gallery = galleryUrls.length ? galleryUrls : fallbackImg ? [fallbackImg] : [];
  const mainImg = gallery[gi] || fallbackImg || '';
  const price = d?.min_price_per_day ?? vehicle.min_price_per_day;

  // Additional paid accessories (Stage 5) — a SINGLE horizontal scroll-snap
  // row, not a grid: with many categories/items a grid would grow the modal's
  // height indefinitely. Categories are flattened into one ordered list (never
  // interleaved — all of one category's items before the next); each tile
  // carries its own small category caption, since there's no room for a sticky
  // group header in a horizontal strip. Items are never hidden for being
  // unavailable, only dimmed; a category with nothing available at all is
  // already omitted server-side (EC9). Lives on the "how to book?" screen,
  // right under the vehicle (owner feedback 2026-07-16) — the customer picks
  // add-ons in the same place they choose how to book, so there's no separate
  // read-only summary anymore.
  const renderAccessories = () => {
    if (!d || (d.accessories ?? []).length === 0) return null;
    return (
      <div className="sb-vd__accessories">
        <span className="sb-vd__section-label">{t.accessories}</span>
        <div className="sb-acc__row">
          {d.accessories!.flatMap((group) =>
            group.items.map((item) => {
              const qty = accessories[item.id] || 0;
              const unavailable = item.available_stock !== null && item.available_stock <= 0;
              const atMax = !unavailable && item.available_stock !== null && qty >= item.available_stock;
              const itemName = locale === 'ru' ? item.name_ru : item.name_en;
              const categoryName = locale === 'ru' ? group.name_ru : group.name_en;
              return (
                <div className={`sb-acc__item ${unavailable ? 'is-unavailable' : ''}`} key={item.id}>
                  <span className="sb-acc__item-category">{categoryName}</span>
                  {item.photo_url ? (
                    // Tapping the photo OR the expand badge opens the same
                    // fullscreen preview — the badge is purely a visual
                    // "you can tap this" affordance, no separate handler.
                    <button
                      type="button"
                      className="sb-acc__item-photo sb-acc__item-photo--clickable"
                      onClick={() =>
                        setAccessoryLightbox({
                          photoUrl: safeImageUrl(item.photo_url ?? undefined) ?? '',
                          description: item.description,
                          name: itemName,
                        })
                      }
                      aria-label={itemName}
                    >
                      <img src={safeImageUrl(item.photo_url ?? undefined)} alt={itemName} />
                      <span className="sb-acc__item-expand" aria-hidden="true">
                        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="m21 21-6-6m6 6v-4.8m0 4.8h-4.8" />
                          <path d="M3 16.2V21m0 0h4.8M3 21l6-6" />
                          <path d="M21 7.8V3m0 0h-4.8M21 3l-6 6" />
                          <path d="M3 7.8V3m0 0h4.8M3 3l6 6" />
                        </svg>
                      </span>
                    </button>
                  ) : (
                    <div className="sb-acc__item-photo" />
                  )}
                  <div className="sb-acc__item-info">
                    <span className="sb-acc__item-name">{itemName}</span>
                    {item.price != null ? (
                      <span className="sb-acc__item-price">
                        {Math.round(item.price).toLocaleString('en-US')} {t.priceUnit}{' '}
                        {item.price_unit === 'per_day' ? t.perDay : t.perBooking}
                      </span>
                    ) : null}
                    {unavailable ? (
                      <span className="sb-acc__item-unavailable">{t.accUnavailable}</span>
                    ) : null}
                  </div>
                  {/* 44x44 touch targets (Apple HIG / Material minimum). */}
                  <div className="sb-acc__stepper">
                    <button
                      type="button"
                      aria-label="-"
                      disabled={qty === 0}
                      onClick={() =>
                        setAccessories((prev) => {
                          const next = { ...prev };
                          if (qty - 1 <= 0) delete next[item.id];
                          else next[item.id] = qty - 1;
                          return next;
                        })
                      }
                    >
                      −
                    </button>
                    <span className="sb-acc__stepper-value">{qty}</span>
                    <button
                      type="button"
                      aria-label="+"
                      disabled={unavailable || atMax}
                      onClick={() => setAccessories((prev) => ({ ...prev, [item.id]: qty + 1 }))}
                    >
                      +
                    </button>
                  </div>
                </div>
              );
            }),
          )}
        </div>
      </div>
    );
  };

  return createPortal(
    // Wrap in .sb-root so the design tokens (--sb-*) cascade into the portal,
    // which lives outside the page's .sb-root.
    <div className="sb-root">
    <div className="sb-modal" role="dialog" aria-modal="true" onClick={onClose}>
      <div
        className="sb-modal__dialog"
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        style={
          dragY > 0 || dragSmooth
            ? { transform: `translateY(${dragY}px)`, transition: dragSmooth ? 'transform 0.3s ease-out' : 'none' }
            : undefined
        }
      >
        {/* Mobile-only grab handle (CSS-hidden ≥640px): swipe down to dismiss. */}
        <div
          className="sb-modal__grabber"
          onTouchStart={onGrabStart}
          onTouchMove={onGrabMove}
          onTouchEnd={onGrabEnd}
        >
          <span className="sb-modal__grabber-bar" aria-hidden />
        </div>
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
              {gallery.length > 0 ? (
                <div className="sb-vd__media">
                  <div className="sb-vd__gallery">
                    {/* Scroll-snap track — one slide per image; native swipe + snap. */}
                    <div className="sb-vd__frame" ref={trackRef} onScroll={onTrackScroll}>
                      {gallery.map((u, i) => (
                        <img
                          key={i}
                          className="sb-vd__photo"
                          src={u}
                          alt={d.display_name}
                          loading={i === 0 ? undefined : 'lazy'}
                          draggable={false}
                        />
                      ))}
                    </div>
                    {gallery.length > 1 ? (
                      <>
                        <button
                          type="button"
                          className="sb-vd__nav sb-vd__nav--prev"
                          aria-label="‹"
                          onClick={() => scrollToImage(gi - 1, gallery.length)}
                        >
                          ‹
                        </button>
                        <button
                          type="button"
                          className="sb-vd__nav sb-vd__nav--next"
                          aria-label="›"
                          onClick={() => scrollToImage(gi + 1, gallery.length)}
                        >
                          ›
                        </button>
                        <span className="sb-vd__counter">
                          {gi + 1}/{gallery.length}
                        </span>
                      </>
                    ) : null}
                  </div>
                  {gallery.length > 1 ? (
                    <div className="sb-vd__thumbs">
                      {gallery.map((u, i) => (
                        <button
                          type="button"
                          key={i}
                          className={`sb-vd__thumb ${i === gi ? 'is-active' : ''}`}
                          onClick={() => scrollToImage(i, gallery.length)}
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
                <div className="sb-vd__header">
                  <h3 className="sb-vd__name">{d.display_name}</h3>
                  {price != null ? (
                    <p className="sb-vd__price">
                      <small>{t.from} </small>
                      {Math.round(price).toLocaleString('en-US')}
                      <small>
                        {' '}
                        {t.priceUnit}
                        {t.perDay}
                      </small>
                    </p>
                  ) : null}
                </div>

                <div className="sb-vd__meta-row">
                  {d.year ? <span className="sb-vd__year">{d.year}</span> : null}
                  {d.category ? (
                    <span className="sb-vd__badge" style={{ backgroundColor: d.category.color }}>
                      {categoryLabel(d.category, locale)}
                    </span>
                  ) : null}
                  <button
                    type="button"
                    className={`sb-vd__share ${copied ? 'is-copied' : ''}`}
                    onClick={handleShare}
                    aria-label={t.share}
                  >
                    <svg
                      className="sb-vd__share-ico"
                      viewBox="0 0 24 24"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden
                    >
                      <circle cx="18" cy="5" r="3" />
                      <circle cx="6" cy="12" r="3" />
                      <circle cx="18" cy="19" r="3" />
                      <line x1="8.6" y1="13.5" x2="15.4" y2="17.5" />
                      <line x1="15.4" y1="6.5" x2="8.6" y2="10.5" />
                    </svg>
                    {copied ? t.copied : t.share}
                  </button>
                </div>

                {/* Availability — the prominent status (full-width banner). */}
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
                          <span className="sb-vd__price-period">
                            {row.is_monthly
                              ? `${row.period_label} ${t.days} (${t.month})`
                              : row.min_days === row.max_days
                                ? `${row.period_label} ${row.min_days === 1 ? t.day : t.days}`
                                : `${row.period_label} ${t.days}`}
                          </span>
                          <span className="sb-vd__price-value">
                            {row.is_monthly && row.monthly_price != null ? (
                              <>
                                {money(row.monthly_price)}
                                <small>
                                  {' '}
                                  ({Math.round(row.price_per_day).toLocaleString('en-US')}
                                  {t.perDay})
                                </small>
                              </>
                            ) : (
                              <>
                                {Math.round(row.price_per_day).toLocaleString('en-US')}
                                <small>
                                  {' '}
                                  {t.priceUnit}
                                  {t.perDay}
                                </small>
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

                {/* Equipment (vehicle.options — concrete features like CarPlay/
                    sunroof) — more decision-relevant to a renter than raw
                    technical Specs, so it comes first (conversion-order
                    review 2026-07-15). Labelled (unlike the previous bare
                    chip row) to match the section-label pattern used
                    elsewhere (Specs/Deposit/Additional Options). */}
                {(d.options ?? []).length > 0 ? (
                  <div className="sb-vd__equipment-wrap">
                    <span className="sb-vd__section-label">{t.equipment}</span>
                    <div className="sb-vd__chips">
                      {d.options!.map((o, i) => (
                        <span className="sb-chip sb-chip--ghost" key={i}>
                          {o}
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
                          <span className="sb-vd__section-label">{t.specs}</span>
                          <div className="sb-vd__specs-card">
                            <div className="sb-vd__specs">
                              {visible.map((k) => {
                                const raw = String(d[k]);
                                const val = TRANSLATED_SPEC_KEYS.has(k)
                                  ? (SPEC_VALUE_LABELS[locale][raw.toLowerCase()] ?? raw)
                                  : raw;
                                return (
                                  <div className="sb-vd__spec" key={k}>
                                    <span>{t.labels[k]}</span>
                                    <b>{val}</b>
                                  </div>
                                );
                              })}
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
                        </div>
                      );
                    })()
                  : null}
              </div>

              <div className="sb-vd__cta">
                <button
                  type="button"
                  className="sb-btn sb-vd__cta-btn"
                  onClick={() => setStage('choice')}
                >
                  {t.bookCta}
                </button>
              </div>
            </div>
          ) : stage === 'choice' ? (
            <div className="sb-modal__body sb-modal__body--book">
              <button type="button" className="sb-vd__back" onClick={() => setStage('detail')}>
                ‹ {t.back}
              </button>
              <h3 className="sb-bk__title">{t.howToBook}</h3>
              <div className="sb-bk__vehicle">
                {mainImg ? <img className="sb-bk__photo" src={mainImg} alt="" /> : null}
                <div className="sb-bk__meta">
                  <p className="sb-bk__name">{d.display_name}</p>
                  {price != null ? (
                    <p className="sb-bk__price">
                      <small>{t.from} </small>
                      {Math.round(price).toLocaleString('en-US')}
                      <small>
                        {' '}
                        {t.priceUnit}
                        {t.perDay}
                      </small>
                    </p>
                  ) : null}
                </div>
              </div>

              {/* Paid-accessory picker — moved here from the vehicle-detail
                  screen (owner feedback 2026-07-16): the customer picks add-ons
                  in the very place they choose how to book, right under the
                  vehicle, so there's no separate detail-screen block and no
                  read-only summary anymore. Same interactive carousel. */}
              {renderAccessories()}

              <div className="sb-vd__dates">
                <label>
                  {t.dateGet}
                  <input
                    type="date"
                    className="sb-input"
                    value={start}
                    min={minStart}
                    onChange={(e) => setStart(e.target.value)}
                  />
                </label>
                <label>
                  {t.dateReturn}
                  <input
                    type="date"
                    className="sb-input"
                    value={end}
                    min={nextDay(start)}
                    onChange={(e) => setEnd(e.target.value)}
                  />
                </label>
              </div>

              {/* Delivery/collection by address (Stage 6) — moved here from the
                  manual-form-only screen (owner feedback 2026-07-16: the
                  1-click Telegram path shared no way to request delivery at
                  all, since these toggles used to live only inside "Fill in
                  manually"). Shared state (pickupEnabled/dropoffEnabled/
                  pickup­Location/dropoffLocation) already feeds BOTH
                  handleTelegramBooking and submit(), so surfacing it once
                  here — right under the dates, before either booking path is
                  chosen — makes it apply to both without duplicating state. */}
              <DeliveryAddressSection
                apiKey={googleMapsApiKey}
                pickupEnabled={pickupEnabled}
                dropoffEnabled={dropoffEnabled}
                pickupLocation={pickupLocation}
                dropoffLocation={dropoffLocation}
                dropoffSameAsPickup={dropoffSameAsPickup}
                onPickupToggle={(enabled) => {
                  setPickupEnabled(enabled);
                  if (!enabled) setPickupLocation(null);
                }}
                onDropoffToggle={(enabled) => {
                  setDropoffEnabled(enabled);
                  if (!enabled) setDropoffLocation(null);
                }}
                onPickupSelect={setPickupLocation}
                onDropoffSelect={(loc) => {
                  // The user explicitly picked a distinct collection address —
                  // turn "same as delivery" OFF so a later-enabled delivery
                  // can't silently overwrite it (the picker is only reachable
                  // when not mirroring, so this only fires on a deliberate pick).
                  setDropoffLocation(loc);
                  setDropoffSameAsPickup(false);
                }}
                onDropoffSameToggle={setDropoffSameAsPickup}
                strings={{
                  title: t.deliveryTitle,
                  pickupToggle: t.deliveryPickup,
                  dropoffToggle: t.deliveryDropoff,
                  unavailable: t.deliveryUnavailable,
                  loading: t.loading,
                  showMap: t.deliveryShowMap,
                  hideMap: t.deliveryHideMap,
                  mapHint: t.deliveryMapHint,
                  sameAsPickup: t.deliverySameAsPickup,
                }}
              />

              <button
                type="button"
                className="sb-vd__tg-card"
                disabled={!datesValid || tgSubmitting}
                onClick={handleTelegramBooking}
              >
                <span className="sb-vd__tg-icon" aria-hidden>
                  ✈
                </span>
                <span className="sb-vd__tg-text">
                  <span className="sb-vd__tg-title">{t.tgQuick}</span>
                  <span className="sb-vd__tg-sub">{tgSubmitting ? t.loading : t.tgQuickSub}</span>
                </span>
                <span className="sb-vd__tg-arrow" aria-hidden>
                  ›
                </span>
              </button>
              {tgErr ? <p className="sb-form__status sb-form__status--err">{tgErr}</p> : null}

              <div className="sb-vd__or">{t.or}</div>

              <button
                type="button"
                className="sb-vd__option-card"
                disabled={!datesValid}
                onClick={() => setStage('form')}
              >
                <span className="sb-vd__option-icon" aria-hidden>
                  ✎
                </span>
                <span className="sb-vd__tg-text">
                  <span className="sb-vd__tg-title">{t.manual}</span>
                  <span className="sb-vd__tg-sub">{t.manualSub}</span>
                </span>
                <span className="sb-vd__tg-arrow" aria-hidden>
                  ›
                </span>
              </button>
            </div>
          ) : (
            <div className="sb-modal__body sb-modal__body--book">
              <button type="button" className="sb-vd__back" onClick={() => setStage('choice')}>
                ‹ {t.back}
              </button>
              <h3 className="sb-bk__title">{t.formTitle}</h3>
              <div className="sb-bk__vehicle">
                {mainImg ? <img className="sb-bk__photo" src={mainImg} alt="" /> : null}
                <div className="sb-bk__meta">
                  <p className="sb-bk__name">{d.display_name}</p>
                  {price != null ? (
                    <p className="sb-bk__price">
                      <small>{t.from} </small>
                      {Math.round(price).toLocaleString('en-US')}
                      <small>
                        {' '}
                        {t.priceUnit}
                        {t.perDay}
                      </small>
                    </p>
                  ) : null}
                </div>
              </div>

              <form className="sb-vd__book" onSubmit={submit}>
                <label className="sb-vd__field">
                  <span className="sb-vd__field-label">{t.name}</span>
                  <input
                    className="sb-input"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>

                <div className="sb-vd__field">
                  <span className="sb-vd__field-label">{t.contactWay}</span>
                  <div className="sb-vd__channel" role="group" aria-label={t.contactWay}>
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
                </div>

                <label className="sb-vd__field">
                  <span className="sb-vd__field-label">{t.phoneLabel}</span>
                  <input
                    className="sb-input"
                    type="text"
                    placeholder={channel === 'whatsapp' ? t.phonePh : t.tgPh}
                    required
                    value={contact}
                    onChange={(e) => setContact(e.target.value)}
                  />
                </label>

                <p className="sb-vd__dates-summary">
                  {t.dateGet}: <b>{formatShortDate(start, locale)}</b>
                  {' — '}
                  {t.dateReturn}: <b>{formatShortDate(end, locale)}</b>
                </p>

                {/* Delivery/collection choice now lives on the PREVIOUS
                    ("How to book?") screen, right under the dates — it must
                    apply to both the Telegram and manual paths, and this form
                    only handles name/contact. Read-only echo here mirrors the
                    dates-summary line above it, same reasoning. */}
                {effectivePickupLocation ? (
                  <p className="sb-vd__dates-summary">
                    {t.deliveryPickup}: <b>{effectivePickupLocation.address}</b>
                  </p>
                ) : null}
                {effectiveDropoffLocation ? (
                  <p className="sb-vd__dates-summary">
                    {t.deliveryDropoff}: <b>{effectiveDropoffLocation.address}</b>
                  </p>
                ) : null}

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
    {accessoryLightbox ? (
      <div
        className="sb-acc-lightbox"
        role="dialog"
        aria-modal="true"
        onClick={() => setAccessoryLightbox(null)}
      >
        <button
          type="button"
          className="sb-acc-lightbox__close"
          aria-label={t.closePhoto}
          onClick={() => setAccessoryLightbox(null)}
        >
          ×
        </button>
        <img
          className="sb-acc-lightbox__photo"
          src={accessoryLightbox.photoUrl}
          alt={accessoryLightbox.name}
          onClick={(e) => e.stopPropagation()}
        />
        {accessoryLightbox.description ? (
          <div className="sb-acc-lightbox__caption">{accessoryLightbox.description}</div>
        ) : null}
      </div>
    ) : null}
    </div>,
    document.body,
  );
}
