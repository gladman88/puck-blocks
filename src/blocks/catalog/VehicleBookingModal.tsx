import { useEffect, useLayoutEffect, useRef, useState, type FormEvent, type TouchEvent as ReactTouchEvent } from 'react';
import { createPortal } from 'react-dom';
import { categoryLabel, type CatalogVehicle } from '../VehicleCatalog';
import { safeHref, safeImageUrl } from '../../sanitize';
import {
  daysBetween,
  formatDDMMYYYY,
  formatDayMonth,
  formatDayMonthRange,
  formatShortDate,
  money,
  pluralDays,
  todayISO,
} from './dates';
import { AvailabilityCalendar } from './AvailabilityCalendar';
import { busyDaysIn, isDayBusy, maxReturnDay, unitCovering, type UnitAvailability } from './availability';
import { DeliveryAddressSection, type PickedLocation, type DeliveryCost } from './DeliveryAddressSection';
import { buildSpecRows, type VehicleSpecs } from './specs';
import { formatDayPrice } from './price';

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
  price_30_days?: number;
}
// One sellable accessory item, and its category group (Stage 5,
// workspace/docs/accessories.md) — mirrors
// frontend_catalog's CatalogAccessoryItem/CatalogAccessoryCategory. `id: null`
// on a group is the "Без категории"/"Other" fallback bucket, localized
// server-side. available_stock is null = not asked (no date window yet) or
// untracked — never treat null as "unavailable".
interface CatalogAccessoryItem {
  id: string;
  name_ru: string;
  name_en: string;
  /** Thumb variant (400px) — the carousel tile. */
  photo_url: string | null;
  /** Display variant (1280px) — the fullscreen lightbox. */
  photo_full_url: string | null;
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
export interface CatalogVehicleDetail extends CatalogVehicle, Omit<VehicleSpecs, 'vehicle_type'> {
  fuel_type?: string;
  transmission?: string;
  drive_type?: string;
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
    thirtyDays: '30 дней',
    thirtyDaysCalc: 'по тарифу 28+',
    spansSeasons: 'Цены показаны за текущий сезон',
    bookFrom: 'Забронировать с',
    loading: 'Загрузка…',
    error: 'Не удалось загрузить',
    name: 'Ваше имя',
    send: 'Отправить запрос',
    sending: 'Отправляем…',
    tgQuick: 'Бронь в 1 клик через Telegram',
    tgQuickSub: 'Без форм — бот заполнит всё за вас',
    or: 'или',
    howToBook: 'Как забронировать?',
    back: 'Назад',
    bookCta: 'Забронировать',
    formTitle: 'Запрос на бронирование',
    // ⚠ Ручной ввод — ТОЛЬКО WhatsApp (2026-09-14): Telegram-логин, набранный
    // руками, писался в `external_id` дословно (не chat_id) и ломал
    // распознавание того же человека при следующем реальном обращении — тот
    // же клиент заводился повторно, каждый раз с новым реф-агентом. Telegram
    // остаётся доступен, но только через гарантированно-настоящий chat_id из
    // кнопки «в 1 клик» выше.
    manual: 'Указать WhatsApp вручную',
    manualSub: 'Имя и номер — займёт 30 секунд',
    dateGet: 'Дата получения',
    dateReturn: 'Дата возврата',
    phoneLabel: 'Номер WhatsApp',
    successTitle: 'Заявка отправлена!',
    successText: 'Мы скоро свяжемся с вами.',
    tooMany: 'Слишком много запросов, попробуйте позже',
    sendErr: 'Не удалось отправить. Попробуйте ещё раз.',
    phonePh: '+66...',
    phoneInvalid: 'Введите номер с кодом страны, например +66812345678',
    deliveryTitle: 'Доставка',
    deliveryPickup: 'Доставить машину по адресу',
    deliveryDropoff: 'Заберём машину по адресу',
    deliveryUnavailable: 'Поиск адреса временно недоступен',
    deliveryShowMap: 'Выбрать на карте',
    deliveryHideMap: 'Скрыть карту',
    deliveryMapHint: 'Нажмите на место или точку на карте',
    deliverySearchPlaceholder: 'Введите адрес или название места',
    deliverySameAsPickup: 'Такой же адрес, как для доставки',
    deliveryCostPrefix: 'Стоимость',
    deliveryCostLoading: 'Считаем стоимость…',
    deliveryCostByRequest: 'по запросу',
    deliveryCostTotal: 'Доставка и приёмка',
    // Календарь занятости на шаге «Как забронировать?» (владелец 2026-10-09).
    datePlaceholder: 'Выберите',
    datesTitle: 'Даты аренды',
    datesEdit: 'Изменить',
    legendFree: 'свободно',
    legendBusy: 'занято',
    legendYours: 'ваши даты',
    calPickStart: 'Выберите день получения.',
    calPickup: 'Получение',
    calPickReturn: 'Теперь выберите возврат',
    calFreeUntil: 'свободна до',
    calStartBusy: 'модель занята. Выберите день возврата.',
    calFree: 'свободна на эти даты',
    calSelected: 'Выбрано',
    calBusyDays: 'Модель занята:',
    calNoUnit: 'На весь срок свободной машины нет',
    // Занятый срок: заявка та же, меняются только слова.
    askHint: 'На эти даты подберём замену',
    tgAsk: 'Подобрать через Telegram',
    tgAskSub: 'Напишем, что свободно на ваши даты',
    manualAsk: 'Оставить WhatsApp',
    manualAskSub: 'Менеджер подберёт машину и ответит',
    successBusyTitle: 'Запрос получен!',
    successBusyText: (vehicleName: string, dates: string) =>
      `${vehicleName} на ${dates} занята. Менеджер подберёт варианты и свяжется с вами.`,
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
    thirtyDays: '30 days',
    thirtyDaysCalc: 'at the 28+ rate',
    spansSeasons: 'Prices shown for the current season',
    bookFrom: 'Book from',
    loading: 'Loading…',
    error: 'Failed to load',
    name: 'Your name',
    send: 'Send request',
    sending: 'Sending…',
    tgQuick: '1-click booking via Telegram',
    tgQuickSub: 'No forms — the bot fills everything in for you',
    or: 'or',
    howToBook: 'How to book?',
    back: 'Back',
    bookCta: 'Book',
    formTitle: 'Booking request',
    manual: 'Enter WhatsApp manually',
    manualSub: 'Name and number — takes 30 seconds',
    dateGet: 'Pick-up date',
    dateReturn: 'Return date',
    phoneLabel: 'WhatsApp number',
    successTitle: 'Request sent!',
    successText: 'We will contact you shortly.',
    tooMany: 'Too many requests, try later',
    sendErr: 'Could not send. Please try again.',
    phonePh: '+66...',
    phoneInvalid: 'Enter your number with the country code, e.g. +66812345678',
    deliveryTitle: 'Delivery',
    deliveryPickup: 'Deliver the vehicle to my address',
    deliveryDropoff: "We'll pick it up from my address",
    deliveryUnavailable: 'Address search is temporarily unavailable',
    deliveryShowMap: 'Pick on the map',
    deliveryHideMap: 'Hide map',
    deliveryMapHint: 'Tap a place or a point on the map',
    deliverySearchPlaceholder: 'Enter an address or place name',
    deliverySameAsPickup: 'Same address as delivery',
    deliveryCostPrefix: 'Price',
    deliveryCostLoading: 'Calculating price…',
    deliveryCostByRequest: 'on request',
    deliveryCostTotal: 'Delivery & collection',
    datePlaceholder: 'Select',
    datesTitle: 'Rental dates',
    datesEdit: 'Change',
    legendFree: 'available',
    legendBusy: 'booked',
    legendYours: 'your dates',
    calPickStart: 'Choose the pick-up day.',
    calPickup: 'Pick-up',
    calPickReturn: 'Now choose the return day',
    calFreeUntil: 'available until',
    calStartBusy: '— the model is booked. Choose the return day.',
    calFree: 'available for these dates',
    calSelected: 'Selected',
    calBusyDays: 'The model is booked:',
    calNoUnit: 'No vehicle is free for the whole period',
    askHint: "We'll find a replacement for these dates",
    tgAsk: 'Find one via Telegram',
    tgAskSub: "We'll message you what is free for your dates",
    manualAsk: 'Leave your WhatsApp',
    manualAskSub: 'A manager will find a vehicle and reply',
    successBusyTitle: 'Request received!',
    successBusyText: (vehicleName: string, dates: string) =>
      `${vehicleName} is booked for ${dates}. A manager will find options and contact you.`,
  },
} as const;

const HEADERS = { 'ngrok-skip-browser-warning': 'true' };

/** Decide what a booking-intent status poll response means. Pure + exported so
 *  the terminal/transient branches are unit-testable without driving timers:
 *  - 'used'    → the bot redeemed the intent into a booking → show confirmation;
 *  - 'expired' → the intent lapsed unredeemed → stop, no confirmation;
 *  - 'gone'    → 404 (unknown/purged token) → stop;
 *  - 'retry'   → still pending, or a transient error (429/5xx / malformed 2xx
 *                body) → keep polling. */
export function classifyIntentPollResponse(
  res: { ok: boolean; status: number },
  body: { status?: string } | null,
): 'used' | 'expired' | 'gone' | 'retry' {
  if (res.status === 404) return 'gone';
  if (!res.ok) return 'retry';
  if (body?.status === 'used') return 'used';
  if (body?.status === 'expired') return 'expired';
  return 'retry';
}

// useLayoutEffect on the client (resets scroll before the browser paints → no
// flash of the previous stage's scroll offset), plain useEffect on the server
// (the modal only ever mounts client-side, but this silences the SSR warning).
const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Fetch the delivery/collection price for a picked address — the SAME zone
 *  matcher the backend charges with, so the quote equals the eventual charge.
 *  Returns null on any failure (the UI just shows nothing rather than a wrong
 *  number). */
async function fetchDeliveryQuote(apiBase: string, location: PickedLocation): Promise<DeliveryCost> {
  try {
    const res = await fetch(`${apiBase}/api/v1/catalog/delivery-quote/`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', ...HEADERS },
      body: JSON.stringify({ location }),
    });
    if (!res.ok) return null;
    const j = (await res.json()) as { price?: string; matched?: boolean };
    const price = parseFloat(j.price ?? '');
    if (!Number.isFinite(price)) return null;
    return { price, matched: Boolean(j.matched) };
  } catch {
    return null;
  }
}

/** Занятость экземпляров модели — один запрос при открытии окна. Любая неудача
 *  (сеть, 4xx/5xx, старый бэкенд без ручки — 404, чужая форма ответа) → `[]`:
 *  календарь работает без зачёркиваний, заявки уходят как раньше. Экземпляры
 *  возвращаются в порядке `ids` — он задаёт, какую машину брать первой. */
async function fetchAvailability(
  apiBase: string,
  ids: string[],
): Promise<{ units: UnitAvailability[]; today: string | null }> {
  try {
    const res = await fetch(
      `${apiBase}/api/v1/catalog/availability/?vehicle_ids=${ids.map(encodeURIComponent).join(',')}`,
      { headers: HEADERS },
    );
    if (!res.ok) return { units: [], today: null };
    const j = (await res.json()) as { units?: unknown; today?: unknown } | null;
    if (!j || !Array.isArray(j.units)) return { units: [], today: null };
    const byId = new Map<string, UnitAvailability>();
    for (const raw of j.units as Array<Partial<UnitAvailability> | null>) {
      if (!raw || typeof raw.vehicle_id !== 'string' || !Array.isArray(raw.busy)) continue;
      byId.set(raw.vehicle_id, {
        vehicle_id: raw.vehicle_id,
        busy: raw.busy.filter(
          (b) => Boolean(b) && typeof b.start === 'string' && typeof b.end === 'string' && b.start < b.end,
        ),
      });
    }
    return {
      units: ids.map((id) => byId.get(id)).filter((u): u is UnitAvailability => Boolean(u)),
      today: typeof j.today === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(j.today) ? j.today : null,
    };
  } catch {
    return { units: [], today: null };
  }
}

/** Потолок ручки занятости (`vehicle_ids` > 20 → 400). */
const MAX_AVAILABILITY_IDS = 20;

/** «…10 окт.» уже кончается точкой, «…10 мая» / “10 Oct” — нет. */
function withPeriod(text: string): string {
  return text.endsWith('.') ? text : `${text}.`;
}

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
  /** Host-provided handoff for the "1-click via Telegram" deep link. Inside a
   *  Telegram Mini App the host passes `window.Telegram.WebApp.openTelegramLink`
   *  (opens the bot chat natively + closes the mini app) — this component stays
   *  framework-neutral and never touches `window.Telegram` itself. When absent
   *  (plain browser / the marketing site), the modal opens the link in a new
   *  tab instead so the catalog stays alive to poll for confirmation. */
  onTelegramLink?: (url: string) => void;
  /** Dates the customer already picked in the catalog filter (ISO YYYY-MM-DD).
   *  Seed the booking step so they don't re-enter them — only when BOTH came
   *  and the start is not in the past; otherwise the period starts empty (no
   *  "today – tomorrow" default: the customer picks it in the calendar). */
  initialFrom?: string;
  initialTo?: string;
  /** Ids of ALL physical units of this model (the catalog card groups them).
   *  The availability calendar strikes a day out only when every unit is busy,
   *  and the request goes to a unit that is free for the whole period. Absent →
   *  just this vehicle. */
  unitIds?: string[];
  onClose: () => void;
}

// WhatsApp-only phone validation (owner decision 2026-09-14 — Telegram was
// removed from this manual form entirely; see the `manual`/`manualSub` copy
// above for why). MUST start with a country code (`+`): a number typed in
// LOCAL format (no country code, e.g. a Thai `0812345678`) strips to a
// DIFFERENT digit string than the same number typed internationally
// (`+66812345678`), so the same customer booking twice with each format got
// two `Contact` rows with two different `external_id`s — and, when each
// booking carried a different `?ref=`, two different referral agents on what
// was really one person. Forcing `+` here is the whole fix: it can't
// guarantee every input, but it removes the format ambiguity at the source.
const WHATSAPP_PHONE_RE = /^\+[\d\s\-()]{6,19}$/;

function isValidWhatsAppPhone(value: string): boolean {
  const trimmed = value.trim();
  if (!WHATSAPP_PHONE_RE.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, '');
  // E.164: country code + subscriber number, max 15 digits total; shortest
  // real-world numbers (with a country code) run about 8.
  return digits.length >= 8 && digits.length <= 15;
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
  onTelegramLink,
  initialFrom,
  initialTo,
  unitIds,
  onClose,
}: Props) {
  const t = S[locale];
  const [detail, setDetail] = useState<CatalogVehicleDetail | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [gi, setGi] = useState(0);
  const [specsExpanded, setSpecsExpanded] = useState(false);

  // «Сегодня» — по ответу ручки занятости (Пхукет), пока она не пришла — по устройству.
  const [serverToday, setServerToday] = useState<string | null>(null);
  const today = serverToday ?? todayISO();
  // Seed from the catalog filter's picked dates (so the customer doesn't
  // re-enter them) — only a complete, still-bookable pair. No clamping and no
  // default period: an empty period keeps both booking buttons disabled.
  const [seeded] = useState(() =>
    Boolean(initialFrom && initialTo && initialFrom >= todayISO() && initialTo > initialFrom),
  );
  const [start, setStart] = useState(seeded ? initialFrom! : '');
  const [end, setEnd] = useState(seeded ? initialTo! : '');
  // Availability of every unit of the model, `vehicle.id` first — the order
  // decides which unit a free period is booked on.
  const availabilityIds = [vehicle.id, ...(unitIds ?? []).filter((id) => id && id !== vehicle.id)].slice(
    0,
    MAX_AVAILABILITY_IDS,
  );
  const availabilityKey = availabilityIds.join(',');
  const [units, setUnits] = useState<UnitAvailability[]>([]);
  // Занятость ещё грузится (≠ «неизвестна»): до ответа или ошибки кнопки брони выключены.
  const [availLoading, setAvailLoading] = useState(true);
  // Seeded dates start collapsed into one row; «Изменить» (or a seeded period
  // that turned out busy) opens the calendar for good.
  const [datesExpanded, setDatesExpanded] = useState(!seeded);
  // Whether the request that led to the success screen was for busy dates.
  const [successBusy, setSuccessBusy] = useState(false);
  // Prefill the name from the Telegram Mini App user, if the host passed one
  // — still just a starting point, editable. The contact field is WhatsApp-
  // only now (2026-09-14: Telegram was removed from this manual form — see
  // `manual`/`manualSub` copy above), so it never prefills from a Telegram
  // username: that field is a phone number.
  const [name, setName] = useState(telegramUser?.first_name || '');
  const [contact, setContact] = useState('');
  // Inline format-validation error for the phone field — cleared as soon as
  // the customer edits the value, so it never lingers after they've
  // corrected it.
  const [contactError, setContactError] = useState('');
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
  // Synchronous re-entry guard for the manual submit. The `submitting` STATE
  // (and the button's `disabled`) lag one render behind a fast double/triple
  // tap — so on a slow connection an impatient customer's repeated taps all
  // pass the `if (submitting)` check and fire multiple POSTs (prod incident
  // 2026-07-21: one booking → three identical manager notifications). A ref
  // flips synchronously, before the first `await`, closing that window.
  const submittingRef = useRef(false);
  const [stage, setStage] = useState<'detail' | 'choice' | 'form' | 'success'>('detail');
  const [err, setErr] = useState('');
  // 1-click Telegram booking (workspace/docs/catalog.md) — POSTs
  // the current selection to /booking-intents/, then redirects to the bot
  // with the returned token. Separate loading/error state from the manual
  // form's (submitting/err) since they're two independent flows on the same
  // "choice" screen.
  const [tgSubmitting, setTgSubmitting] = useState(false);
  // Same synchronous re-entry guard for the 1-click Telegram path (a double
  // tap would otherwise mint two booking-intents + open two tabs).
  const tgSubmittingRef = useRef(false);
  const [tgErr, setTgErr] = useState('');
  // After the 1-click handoff, poll the intent's status so the catalog can show
  // the in-app "заявка отправлена" confirmation once the customer finishes in
  // the bot and returns to this (still-open) tab — the browser case, where the
  // booking is created out-of-band and the app otherwise can't know. Non-null
  // = a redemption poll is live for this token; see the effect below.
  const [pollToken, setPollToken] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);

  // Land at the TOP of each stage. The detail / "how to book?" / form stages
  // share one scroll container (the .sb-modal overlay on desktop, the inner
  // .sb-modal__body on mobile) and React reuses that node across stages — so
  // without this the new stage inherits the previous one's scroll offset. E.g.
  // reading the specs at the bottom of the detail screen and tapping
  // «Забронировать» dropped the user at the bottom of the choice screen,
  // losing context (owner feedback 2026-07-16). Reset both possible scrollers
  // on every stage change (scrollTop assignment, not scrollTo — jsdom-safe and
  // instant, no smooth-scroll animation from the old offset).
  useIsomorphicLayoutEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const overlay = dialog.parentElement; // .sb-modal (desktop scroller)
    if (overlay) overlay.scrollTop = 0;
    const body = dialog.querySelector<HTMLElement>('.sb-modal__body'); // mobile scroller
    if (body) body.scrollTop = 0;
  }, [stage]);

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

  useEffect(() => {
    let cancelled = false;
    setUnits([]);
    setAvailLoading(true);
    fetchAvailability(apiBase, availabilityKey.split(',')).then((r) => {
      if (cancelled) return;
      setUnits(r.units);
      setServerToday(r.today);
      setAvailLoading(false);
    });
    return () => {
      cancelled = true;
    };
  }, [apiBase, availabilityKey]);

  const datesValid = Boolean(start && end && start >= today && end > start);
  // The unit that is free for the whole period (null — nobody, or no data).
  const coveringUnitId = datesValid ? unitCovering(units, start, end) : null;
  // Busy period: the customer is NOT stopped — the same request goes out as a
  // "find me a replacement" one (owner 2026-10-09). Unknown availability
  // (`units` empty) is never a conflict.
  const conflict = datesValid && units.length > 0 && coveringUnitId === null;
  const bookingVehicleId = coveringUnitId ?? vehicle.id;
  const datesCollapsed = !datesExpanded && datesValid && !conflict;

  // A seeded period that turned out busy opens the calendar — and it stays open.
  useEffect(() => {
    if (conflict) setDatesExpanded(true);
  }, [conflict]);

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

  // Delivery/collection price quote for the picked address — the SAME zone
  // matcher the backend charges the booking with, so what the customer sees
  // here equals the eventual charge. 'loading' | null (no location) | resolved.
  const [pickupCost, setPickupCost] = useState<DeliveryCost>(null);
  const [dropoffCost, setDropoffCost] = useState<DeliveryCost>(null);

  useEffect(() => {
    if (!effectivePickupLocation) {
      setPickupCost(null);
      return;
    }
    let cancelled = false;
    setPickupCost('loading');
    fetchDeliveryQuote(apiBase, effectivePickupLocation).then((c) => {
      if (!cancelled) setPickupCost(c);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, effectivePickupLocation?.lat, effectivePickupLocation?.lng]);

  useEffect(() => {
    if (!effectiveDropoffLocation) {
      setDropoffCost(null);
      return;
    }
    let cancelled = false;
    setDropoffCost('loading');
    fetchDeliveryQuote(apiBase, effectiveDropoffLocation).then((c) => {
      if (!cancelled) setDropoffCost(c);
    });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBase, effectiveDropoffLocation?.lat, effectiveDropoffLocation?.lng]);

  const submit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (submittingRef.current || submitting || !datesValid || !name.trim() || !contact.trim()) return;
    if (!isValidWhatsAppPhone(contact)) {
      setContactError(t.phoneInvalid);
      return;
    }
    submittingRef.current = true;
    setSubmitting(true);
    setErr('');
    try {
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-requests/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...HEADERS },
        body: JSON.stringify({
          vehicle_id: bookingVehicleId,
          start_date: start,
          end_date: end,
          customer_name: name.trim(),
          // Manual form is WhatsApp-only (2026-09-14) — Telegram here goes
          // ONLY through the 1-click flow above (handleTelegramBooking),
          // which always carries a real chat_id. No `telegram_user_data`:
          // it would be ignored server-side for this channel anyway, and
          // omitting it keeps this payload honest about what it actually is.
          contact_channel: 'whatsapp',
          contact_identifier: contact.trim(),
          ...(referralCode ? { referral_code: referralCode } : {}),
          ...(selectedAccessories.length > 0 ? { accessories: selectedAccessories } : {}),
          ...(effectivePickupLocation ? { pickup_location: effectivePickupLocation } : {}),
          ...(effectiveDropoffLocation ? { dropoff_location: effectiveDropoffLocation } : {}),
        }),
      });
      if (res.ok) {
        // The server decides at creation time (`dates_busy`); an older backend
        // without the field → what the calendar showed when the form was sent.
        const body = (await res.json().catch(() => null)) as { dates_busy?: unknown } | null;
        setSuccessBusy(typeof body?.dates_busy === 'boolean' ? body.dates_busy : conflict);
        setStage('success');
      } else {
        setErr(res.status === 429 ? t.tooMany : t.sendErr);
      }
    } catch {
      setErr(t.sendErr);
    } finally {
      submittingRef.current = false;
      setSubmitting(false);
    }
  };

  // Poll the intent until the bot redeems it into a real booking ('used') or it
  // lapses ('expired' / 404), then show the in-app confirmation. This closes the
  // loop for the browser case, where the booking is created out-of-band in the
  // Telegram bot and the catalog otherwise can't know the outcome. Cheap indexed
  // read (no PII); we poll on an interval AND whenever the tab regains focus (the
  // moment the customer returns from Telegram), with a hard cap so it never runs
  // forever. In a Mini App that closed on handoff this simply never mounts.
  useEffect(() => {
    if (!pollToken) return;
    let stopped = false;
    let inFlight = false; // no overlapping polls (interval + visibility + slow network)
    const check = async () => {
      if (stopped || inFlight) return;
      inFlight = true;
      try {
        const res = await fetch(
          `${apiBase}/api/v1/catalog/booking-intents/${encodeURIComponent(pollToken)}/status/`,
          { headers: HEADERS },
        );
        if (stopped) return; // torn down while the request was in flight
        const body = res.ok ? ((await res.json()) as { status?: string }) : null;
        if (stopped) return;
        const verdict = classifyIntentPollResponse(res, body);
        if (verdict === 'used') {
          stopped = true;
          setPollToken(null);
          setStage('success');
        } else if (verdict === 'expired' || verdict === 'gone') {
          stopped = true;
          setPollToken(null);
        }
        // 'retry' (pending / transient 429/5xx / malformed body) → keep polling
      } catch {
        // Network blip — the interval will retry.
      } finally {
        inFlight = false;
      }
    };
    const interval = setInterval(check, 4000);
    const onVisible = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') check();
    };
    if (typeof document !== 'undefined') document.addEventListener('visibilitychange', onVisible);
    const timeout = setTimeout(() => { stopped = true; setPollToken(null); }, 5 * 60 * 1000);
    check(); // immediate first check
    return () => {
      stopped = true;
      clearInterval(interval);
      clearTimeout(timeout);
      if (typeof document !== 'undefined') document.removeEventListener('visibilitychange', onVisible);
    };
  }, [pollToken, apiBase]);

  // 1-click Telegram booking (workspace/docs/catalog.md):
  // Telegram's /start payload caps at 64 chars, far too small to carry
  // accessories/delivery addresses directly — so the current selection is
  // POSTed to a booking-intent first, and only the returned token travels in
  // the deep link. The bot resolves it back into the full selection.
  const handleTelegramBooking = async () => {
    if (tgSubmittingRef.current || tgSubmitting || !datesValid) return;
    tgSubmittingRef.current = true;
    setTgSubmitting(true);
    setTgErr('');
    // The booking is created out-of-band by the bot — the success screen (shown
    // once the intent is redeemed) goes by what the calendar showed at the tap.
    setSuccessBusy(conflict);
    let popup: Window | null = null;
    try {
      // Browser fallback opens the bot in a NEW tab, so the catalog stays alive
      // to poll for confirmation. Opened synchronously here (before the `await`)
      // so it isn't blocked as a popup. The Mini App path uses the host callback
      // instead (native handoff + closes the app) → no placeholder tab there.
      popup = onTelegramLink || typeof window === 'undefined' ? null : window.open('', '_blank');
      const res = await fetch(`${apiBase}/api/v1/catalog/booking-intents/`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', ...HEADERS },
        body: JSON.stringify({
          vehicle_id: bookingVehicleId,
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
        popup?.close();
        return;
      }
      // Guard the token explicitly rather than trusting the response shape —
      // a malformed/partial 2xx body must show a retryable error, not
      // silently navigate to a broken `bk_undefined` deep link.
      const { token } = (await res.json()) as { token?: string };
      if (!token) {
        setTgErr(t.sendErr);
        popup?.close();
        return;
      }
      const href = safeHref(`https://t.me/${botUsername}?start=bk_${encodeURIComponent(token)}`);
      if (!href) {
        setTgErr(t.sendErr);
        popup?.close();
        return;
      }
      // Start polling BEFORE the handoff so a fast redemption isn't missed.
      setPollToken(token);
      if (onTelegramLink) {
        onTelegramLink(href); // Telegram Mini App — native handoff, closes the app
      } else if (popup) {
        popup.location.href = href; // browser — the tab we opened synchronously
      } else {
        window.location.href = href; // popup blocked — same-tab fallback (no poll)
      }
    } catch {
      setTgErr(t.sendErr);
      popup?.close();
    } finally {
      tgSubmittingRef.current = false;
      setTgSubmitting(false);
    }
  };

  const d = detail;
  const specRows = d
    ? buildSpecRows({ ...d, vehicle_type: d.vehicle_type ?? vehicle.vehicle_type }, locale)
    : [];
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
                          // Prefer the large display variant for a crisp
                          // fullscreen; fall back to the thumb (sanitize each
                          // independently so a bad full URL still falls back).
                          photoUrl:
                            safeImageUrl(item.photo_full_url ?? undefined) ??
                            safeImageUrl(item.photo_url ?? undefined) ??
                            '',
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

  // Status line under the calendar — one sentence about the current selection.
  const renderDatesStatus = () => {
    const days = datesValid ? pluralDays(daysBetween(start, end), locale) : '';
    let text: string;
    let tone = '';
    if (!start) {
      text = t.calPickStart;
    } else if (!datesValid) {
      const day = formatDayMonth(start, locale);
      if (isDayBusy(units, start)) {
        text = `${day} ${t.calStartBusy}`;
        tone = 'is-warn';
      } else {
        const limit = maxReturnDay(units, start);
        text =
          `${withPeriod(`${t.calPickup} ${day}`)} ` +
          withPeriod(
            limit ? `${t.calPickReturn} — ${t.calFreeUntil} ${formatDayMonth(limit, locale)}` : t.calPickReturn,
          );
      }
    } else if (conflict) {
      const busy = busyDaysIn(units, start, end).map(([a, b]) => formatDayMonthRange(a, b, locale));
      text =
        `${t.calSelected} ${formatDayMonthRange(start, end, locale)} · ${withPeriod(days)} ` +
        (busy.length > 0 ? `${t.calBusyDays} ${busy.join(', ')}` : t.calNoUnit);
      tone = 'is-warn';
    } else {
      // "Free" is claimed only when availability is actually known.
      const parts = [
        ...(datesCollapsed ? [] : [`${formatDayMonth(start, locale)} → ${formatDayMonth(end, locale)}`]),
        days,
        ...(units.length > 0 ? [t.calFree] : []),
      ];
      text = parts.join(' · ');
      if (units.length > 0) tone = 'is-ok';
    }
    return (
      <p className={`sb-avcal__status ${tone}`} aria-live="polite">
        {text}
      </p>
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
              <h3>{successBusy ? t.successBusyTitle : t.successTitle}</h3>
              <p>
                {successBusy
                  ? t.successBusyText(
                      d.display_name,
                      `${formatShortDate(start, locale)} – ${formatShortDate(end, locale)}`,
                    )
                  : t.successText}
              </p>
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
                      {formatDayPrice(price)}
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
                        // New start, the return day is picked in the calendar.
                        setStart(d.free_from!);
                        setEnd('');
                        setDatesExpanded(true);
                        setStage('choice');
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
                            {row.min_days === row.max_days
                              ? `${row.period_label} ${row.min_days === 1 ? t.day : t.days}`
                              : `${row.period_label} ${t.days}`}
                          </span>
                          <span className="sb-vd__price-value">
                            {formatDayPrice(row.price_per_day)}
                            <small>
                              {' '}
                              {t.priceUnit}
                              {t.perDay}
                            </small>
                          </span>
                        </div>
                      ))}
                      {(() => {
                        const last = d.pricing_table![d.pricing_table!.length - 1];
                        if (!last || last.price_30_days == null) return null;
                        return (
                          <div className="sb-vd__price-row sb-vd__price-row--total">
                            <span className="sb-vd__price-period">
                              <b>{t.thirtyDays}</b>
                              {t.thirtyDaysCalc}
                            </span>
                            <span className="sb-vd__price-value">
                              {last.price_30_days.toLocaleString('en-US')}
                              <small> {t.priceUnit}</small>
                            </span>
                          </div>
                        );
                      })()}
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

                {/* Specs — first 4, rest behind a toggle; rows and units: ./specs.ts */}
                {specRows.length
                  ? (() => {
                      const visible = specsExpanded ? specRows : specRows.slice(0, 4);
                      return (
                        <div className="sb-vd__specs-wrap">
                          <span className="sb-vd__section-label">{t.specs}</span>
                          <div className="sb-vd__specs-card">
                            <div className="sb-vd__specs">
                              {visible.map((row) => (
                                <div className="sb-vd__spec" key={row.key}>
                                  <span>{row.label}</span>
                                  <b>{row.value}</b>
                                </div>
                              ))}
                            </div>
                            {specRows.length > 4 ? (
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
                      {formatDayPrice(price)}
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

              {/* Dates: two read-only value fields + the availability calendar
                  (no native date inputs — the customer must SEE which days the
                  model is taken). Dates seeded from the catalog filter and free
                  → one collapsed row, like the filter's own compact panel. */}
              <div className={`sb-avcal-block${datesCollapsed ? ' is-collapsed' : ''}`}>
                {datesCollapsed ? (
                  <div className="sb-filterbar__availability is-ready is-compact sb-avcal__summary">
                    <div className="sb-filterbar__availability-compact">
                      <div className="sb-filterbar__availability-summary">
                        <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="sb-filterbar__availability-title">{t.datesTitle}</span>
                        <span className="sb-filterbar__availability-range">
                          {formatDDMMYYYY(start)} — {formatDDMMYYYY(end)}
                        </span>
                      </div>
                      <button
                        type="button"
                        className="sb-filterbar__availability-edit"
                        onClick={() => setDatesExpanded(true)}
                      >
                        {t.datesEdit}
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="sb-vd__dates">
                      <div className="sb-avcal__field">
                        <span>{t.dateGet}</span>
                        <span className={`sb-input sb-avcal__value${start ? '' : ' is-placeholder'}`}>
                          {start ? formatDDMMYYYY(start) : t.datePlaceholder}
                        </span>
                      </div>
                      <div className="sb-avcal__field">
                        <span>{t.dateReturn}</span>
                        <span className={`sb-input sb-avcal__value${end ? '' : ' is-placeholder'}`}>
                          {end ? formatDDMMYYYY(end) : t.datePlaceholder}
                        </span>
                      </div>
                    </div>
                    <AvailabilityCalendar
                      units={units}
                      today={today}
                      start={start}
                      end={end}
                      locale={locale}
                      onChange={(nextStart, nextEnd) => {
                        setStart(nextStart);
                        setEnd(nextEnd);
                      }}
                    />
                    <div className="sb-avcal__legend">
                      <span>
                        <i className="sb-avcal__legend-free" aria-hidden>9</i>
                        {t.legendFree}
                      </span>
                      <span>
                        <i className="sb-avcal__legend-busy" aria-hidden>12</i>
                        {t.legendBusy}
                      </span>
                      <span>
                        <i className="sb-avcal__legend-yours" aria-hidden>14</i>
                        {t.legendYours}
                      </span>
                    </div>
                  </>
                )}
                {renderDatesStatus()}
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
                pickupCost={pickupCost}
                dropoffCost={dropoffCost}
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
                  searchPlaceholder: t.deliverySearchPlaceholder,
                  showMap: t.deliveryShowMap,
                  hideMap: t.deliveryHideMap,
                  mapHint: t.deliveryMapHint,
                  sameAsPickup: t.deliverySameAsPickup,
                  costPrefix: t.deliveryCostPrefix,
                  costLoading: t.deliveryCostLoading,
                  costByRequest: t.deliveryCostByRequest,
                  costTotal: t.deliveryCostTotal,
                  currency: t.priceUnit,
                }}
              />

              <div className="sb-vd__book-actions">
                {conflict ? <p className="sb-avcal__ask">{t.askHint}</p> : null}
                <button
                  type="button"
                  className="sb-vd__tg-card"
                  disabled={!datesValid || availLoading || tgSubmitting}
                  onClick={handleTelegramBooking}
                >
                  <span className="sb-vd__tg-icon" aria-hidden>
                    ✈
                  </span>
                  <span className="sb-vd__tg-text">
                    <span className="sb-vd__tg-title">{conflict ? t.tgAsk : t.tgQuick}</span>
                    <span className="sb-vd__tg-sub">
                      {tgSubmitting ? t.loading : conflict ? t.tgAskSub : t.tgQuickSub}
                    </span>
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
                  disabled={!datesValid || availLoading}
                  onClick={() => setStage('form')}
                >
                  <span className="sb-vd__option-icon" aria-hidden>
                    ✎
                  </span>
                  <span className="sb-vd__tg-text">
                    <span className="sb-vd__tg-title">{conflict ? t.manualAsk : t.manual}</span>
                    <span className="sb-vd__tg-sub">{conflict ? t.manualAskSub : t.manualSub}</span>
                  </span>
                  <span className="sb-vd__tg-arrow" aria-hidden>
                    ›
                  </span>
                </button>
              </div>
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
                      {formatDayPrice(price)}
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
                  {/* The error message lives OUTSIDE the <label> on purpose —
                      testing-library (and every screen reader) computes a
                      wrapping label's accessible name from ALL of its text
                      content, so an error span nested inside would get
                      concatenated into the label text itself (e.g. "Phone
                      numberEnter a phone number…"), breaking exact-label
                      lookups/associations. `aria-describedby` links it back
                      without that side effect. */}
                  <label className="sb-vd__field">
                    <span className="sb-vd__field-label">{t.phoneLabel}</span>
                    <input
                      className="sb-input"
                      type="text"
                      placeholder={t.phonePh}
                      required
                      value={contact}
                      onChange={(e) => { setContact(e.target.value); setContactError(''); }}
                      aria-invalid={!!contactError}
                      aria-describedby={contactError ? 'sb-vd-contact-error' : undefined}
                    />
                  </label>
                  {contactError ? (
                    <span id="sb-vd-contact-error" className="sb-vd__field-error">{contactError}</span>
                  ) : null}
                </div>

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
                  {submitting ? (
                    <>
                      <span className="sb-btn__spinner" aria-hidden="true" />
                      {t.sending}
                    </>
                  ) : (
                    t.send
                  )}
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
        {/* The figure shrink-wraps the image so the caption overlays the
            photo's bottom edge (within its width), not the viewport. */}
        <figure className="sb-acc-lightbox__figure" onClick={(e) => e.stopPropagation()}>
          <img
            className="sb-acc-lightbox__photo"
            src={accessoryLightbox.photoUrl}
            alt={accessoryLightbox.name}
          />
          {accessoryLightbox.description ? (
            <figcaption className="sb-acc-lightbox__caption">{accessoryLightbox.description}</figcaption>
          ) : null}
        </figure>
      </div>
    ) : null}
    </div>,
    document.body,
  );
}
