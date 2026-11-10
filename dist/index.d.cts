import { Config } from '@puckeditor/core';
import * as react from 'react';
import { ReactNode } from 'react';

interface HeroProps {
    heading: string;
    /** Word/phrase inside `heading` to highlight in the accent colour (gold). */
    accentWord?: string;
    subheading?: string;
    /** Optional background image URL. */
    backgroundImage?: string;
    /** Phone-only background video (HEVC first, H.264 fallback); desktop keeps the image. */
    mobileVideoHevc?: string;
    mobileVideo?: string;
    /** Poster frame shown until the video plays (first frame of the video). */
    mobileVideoPoster?: string;
    ctaLabel?: string;
    ctaHref?: string;
    /** Second, outlined button next to the CTA (e.g. «Каталог» → `#car`). */
    secondaryLabel?: string;
    secondaryHref?: string;
    /** Legacy: round WhatsApp/Telegram buttons by the CTA were removed (owner
     *  2026-11-04 — the header already has them). Kept optional so pages saved
     *  with these props still type-check; the block ignores them. */
    whatsapp?: string;
    telegram?: string;
}
/**
 * Full-bleed hero — content left-aligned over a darkened background image, with
 * an uppercase heading (one word accented) and a CTA row that can carry round
 * WhatsApp/Telegram buttons. Framework-neutral; styled by the shipped CSS.
 */
declare function Hero({ heading, accentWord, subheading, backgroundImage, mobileVideoHevc, mobileVideo, mobileVideoPoster, ctaLabel, ctaHref, secondaryLabel, secondaryHref, }: HeroProps): react.JSX.Element;

interface RichTextProps {
    /** Plain text. Blank lines separate paragraphs; single newlines are preserved. */
    content: string;
}
/** Simple text section. Framework-neutral; styled by the shipped design CSS. */
declare function RichText({ content }: RichTextProps): react.JSX.Element;

interface StatItem {
    value: string;
    text?: string;
}
interface StatCountersProps {
    heading?: string;
    items: StatItem[];
}
/**
 * Advantage cards: a check-badge, a bold title, a description. Cards alternate
 * gold/dark and step up-and-down (zigzag), matching the marketing site.
 */
declare function StatCounters({ heading, items }: StatCountersProps): react.JSX.Element;

interface AboutPromoProps {
    heading: string;
    text?: string;
    image?: string;
    /** Optional video (YouTube). Shown in the media column above the image. */
    videoUrl?: string;
    imagePosition?: 'left' | 'right';
}
/**
 * Headline promo block: text on one side, media (video and/or image) on the
 * other. 2-col on desktop, stacked on mobile. Renders text-only when no media.
 */
declare function AboutPromo({ heading, text, image, videoUrl, imagePosition, puck, }: AboutPromoProps & {
    puck?: {
        metadata?: {
            locale?: string;
        };
    };
}): react.JSX.Element;

interface FeatureItem {
    icon?: string;
    title: string;
    text?: string;
}
interface FeatureCardsProps {
    heading?: string;
    items: FeatureItem[];
    /** Optional video shown as a grid cell (YouTube). */
    videoUrl?: string;
    /** Index at which the video cell is inserted (0-based). Default: end. */
    videoIndex?: number;
}
/**
 * Advantage section: a heading and a grid of icon + title + text items, with an
 * optional video occupying one grid cell — mirrors the site's «как в свою» block
 * (heading + features + video together, NOT a separate promo block).
 */
declare function FeatureCards({ heading, items, videoUrl, videoIndex, puck, }: FeatureCardsProps & {
    puck?: {
        metadata?: {
            locale?: string;
        };
    };
}): react.JSX.Element;

interface TermItem {
    title: string;
    content?: string;
}
interface TermsAccordionProps {
    heading?: string;
    /** Section anchor id so the header nav can scroll here (e.g. "conditions"). */
    anchorId?: string;
    items: TermItem[];
}
/** Collapsible terms/conditions (native <details>, no JS, accessible). */
declare function TermsAccordion({ heading, anchorId, items }: TermsAccordionProps): react.JSX.Element;

/**
 * Language switcher — two circular flag links (RU / EN) in a glassy pill.
 * Framework-neutral: no next/* — each flag is a plain <a> that swaps ONLY the
 * locale prefix of the current path (`/ru/… ↔ /en/…`), preserving the subpath,
 * query and hash. SSR renders `/${target}` (matches on both server and client
 * so there is no hydration mismatch); a mount-time effect then refines the href
 * from `window.location`.
 *
 * Hosts whose locale is NOT a path segment (the standalone catalog: one URL,
 * language held in state) pass `onSelect` — the flags then render as buttons
 * that report the pick instead of navigating. Same markup classes, same look.
 *
 * Inline SVG flags, NOT emoji: regional-indicator emoji render as bare letters
 * ("RU"/"GB") on Windows, so SVG is the only crisp, cross-platform option.
 */
type SiteLocale = 'ru' | 'en';
interface LanguageSwitcherProps {
    current: SiteLocale;
    className?: string;
    /** In-place switch for hosts without a locale path prefix: flags become
     *  buttons calling this instead of links. Omitted = links (site default). */
    onSelect?: (locale: SiteLocale) => void;
}
declare function LanguageSwitcher({ current, className, onSelect }: LanguageSwitcherProps): react.JSX.Element;

type PuckInjected$2 = {
    puck?: {
        metadata?: {
            locale?: string;
        };
    };
};
interface TextReview {
    name?: string;
    rating?: number;
    text?: string;
    avatar?: string;
    /** Full-review screenshot opened by «Читать полностью». */
    screenshot?: string;
}
interface MediaReview {
    /** Video link (YouTube preferred — plays inline). */
    videoUrl?: string;
    /** Photo / screenshot (used when there is no video). */
    photo?: string;
    caption?: string;
}
interface ReviewsCarouselProps {
    heading?: string;
    /** Section anchor id so the header nav can scroll here (e.g. "reviews"). */
    anchorId?: string;
    textReviews?: TextReview[];
    mediaReviews?: MediaReview[];
    /** Override the Puck metadata locale (for non-Puck hosts). */
    locale?: SiteLocale;
}
/**
 * Reviews section with TWO independent carousels: text testimonials (cards with
 * avatar + stars + text) and media reviews (portrait video / photo). Mirrors
 * the original site, where the two are separate rows.
 */
declare function ReviewsCarousel({ heading, anchorId, textReviews, mediaReviews, locale: localeProp, puck, }: ReviewsCarouselProps & PuckInjected$2): react.JSX.Element;

interface NavLink {
    label: string;
    href: string;
}
interface SiteHeaderProps {
    logoText?: string;
    logoImage?: string;
    links: NavLink[];
    phone?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    /** Override the Puck metadata locale (for non-Puck hosts). */
    locale?: SiteLocale;
    /** Page the in-page anchors belong to, for hosts that render the header on
     *  another page: `'/ru'` turns `#car` into `/ru#car` and the logo link into
     *  `/ru`. Empty / absent — anchors stay as they are, the logo leads to `/`. */
    linkBase?: string;
}
/** `#car` → `/ru#car` when a link base is set; any other link is unchanged. */
declare function withLinkBase(href: string, linkBase: string | undefined): string;
type PuckInjected$1 = {
    puck?: {
        metadata?: {
            locale?: string;
        };
    };
};
/**
 * Sticky, blurred dark header. Desktop: brand + anchor nav + language flags +
 * contact icons + phone. Mobile (≤900px): brand + WhatsApp/Telegram/call icons +
 * a hamburger that opens a full-screen drawer (nav + language flags + full
 * contacts). Locale comes from Puck metadata (page locale).
 */
declare function SiteHeader({ logoText, logoImage, links, phone, whatsapp, telegram, instagram, locale: localeProp, linkBase, puck, }: SiteHeaderProps & PuckInjected$1): react.JSX.Element;

interface FooterColumn {
    title: string;
    /** Optional link for the column heading itself (e.g. «Отзывы» → #reviews). */
    titleHref?: string;
    links?: NavLink[];
}
interface FooterProps {
    logoText?: string;
    logoImage?: string;
    /** Legal line under the logo, e.g. «SHIBA TRAVEL CO. LTD». */
    note?: string;
    columns?: FooterColumn[];
    contactsTitle?: string;
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    /** Same as `SiteHeader.linkBase`: `'/ru'` turns the `#reviews` anchors of
     *  the columns into `/ru#reviews` on another page. Empty — as they are. */
    linkBase?: string;
}
/** Multi-column footer: wordmark + nav columns + a contacts column. */
declare function Footer({ logoText, logoImage, note, columns, contactsTitle, phone, email, address, whatsapp, telegram, instagram, linkBase, }: FooterProps): react.JSX.Element;

interface LeadFormProps {
    heading?: string;
    text?: string;
    /** Label above the messenger select. */
    contactLabel?: string;
    buttonLabel?: string;
    successMessage?: string;
    /** Backend endpoint that receives { name, phone, contact_method }. */
    endpoint?: string;
    /** Photo shown beside the form (right column). */
    image?: string;
}
/**
 * Lead/booking card: title + form on the left, a photo on the right (matches
 * the site's «подача за 2 часа» block). Client-interactive — posts JSON to
 * `endpoint`; with no endpoint it just shows the success message (editor
 * preview). Renders inside a client boundary, so no framework directive needed.
 */
declare function LeadForm({ heading, text, contactLabel, buttonLabel, successMessage, endpoint, image, }: LeadFormProps): react.JSX.Element;

type Locale = 'ru' | 'en';
type Num = number | string | null | undefined;
interface VehicleSpecs {
    vehicle_type?: string;
    fuel_type?: string;
    transmission?: string;
    drive_type?: string;
    body_type?: string;
    seats?: Num;
    engine_volume_cc?: Num;
    engine_volume_l?: Num;
    forced_induction?: string;
    battery_kwh?: Num;
    range_km?: Num;
    horse_power_hp?: Num;
    max_speed_kmh?: Num;
    sprint_0_100_s?: Num;
    clearance_mm?: Num;
    weight_kg?: Num;
    tank_volume_l?: Num;
    fuel_consumption_l_100km?: Num;
    power_consumption_kwh_100km?: Num;
}
interface SpecRow {
    key: string;
    label: string;
    value: string;
}
/** Rows in display order. The first four are the key specs shown without the
 * «Все характеристики» toggle: engine (or battery) → power → fuel → transmission. */
declare function buildSpecRows(d: VehicleSpecs, locale: Locale): SpecRow[];

/** A rental period column — `pricing_periods` of the vehicle detail. */
interface PricingPeriod {
    min_days: number;
    /** null = open-ended («28+»). */
    max_days: number | null;
}
/** One season row — `pricing_seasons` of the vehicle detail. Dates are ISO,
 *  `end_date` inclusive; `prices[i]` is the per-day price for `periods[i]`
 *  (decimal string, null = no price row). No season name: it is owner data in
 *  Russian only, the label is built from the dates. */
interface PricingSeason {
    start_date: string;
    end_date: string;
    prices: (string | number | null)[];
}
/** Column caption: «1 день» / «2–3» / «28+» (en «1 day»). */
declare function periodLabel(p: PricingPeriod, locale: 'ru' | 'en'): string;
/**
 * Row caption from the season dates: «Ноябрь» / «2026» for one whole month,
 * «дек – фев» / «2026–2027» for whole months, «1–15 дек» for part of a month
 * (so two seasons inside one month never get the same label).
 */
declare function seasonLabel(start: string, end: string, locale: 'ru' | 'en'): {
    name: string;
    years: string;
};
interface PriceGridProps {
    periods: PricingPeriod[];
    /** Nearest seasons first. */
    seasons: PricingSeason[];
    /** ISO day the «current» season is taken for: the start of the catalog's
     *  date window, else «today» of the availability response. The row whose
     *  dates contain it is highlighted; none contains it (or null) → no highlight. */
    referenceDate: string | null;
    locale: 'ru' | 'en';
    /** The «Цены по сезонам · за сутки, ฿» caption above the table (default
     *  on). Off — a host with its own heading; the table is then labelled by
     *  `aria-label` with the same text. */
    showLabel?: boolean;
}
/** The season that contains `day` (ISO dates compare as strings). */
declare function isCurrentSeason(season: PricingSeason, day: string | null): boolean;
/**
 * «Все цены» of the vehicle window (approved 2026-11-04): rows — seasons,
 * columns — rental periods, per-day prices in whole baht rounded up. The
 * current season is softly highlighted with a gold edge bar; the last (longest)
 * period is gold. Rows run edge to edge of the window: the host sets
 * `--sb-pg-bleed` to its side padding. Digits shrink on a narrow window
 * (container query units in styles.css) so five-digit prices fit 360 px.
 */
declare function PriceGrid({ periods, seasons, referenceDate, locale, showLabel }: PriceGridProps): react.JSX.Element | null;

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
interface CatalogVehicleDetail extends CatalogVehicle, Omit<VehicleSpecs, 'vehicle_type'> {
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
    /** Columns of «Все цены» (rental periods) — absent on an older backend. */
    pricing_periods?: PricingPeriod[];
    /** Up to 6 nearest seasons, per-day price per period — absent on an older backend. */
    pricing_seasons?: PricingSeason[];
    accessories?: CatalogAccessoryGroup[];
}
/** Telegram Mini App user, forwarded by the HOST app from its own
 *  `window.Telegram.WebApp.initData` — this component never reads
 *  `window.Telegram` itself (see VehicleCatalogProps.telegramUser). */
interface TelegramCatalogUser {
    user_id: number;
    username?: string;
    first_name?: string;
    language_code?: string;
}
interface VehicleBookingModalProps {
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
    /** Step the window opens on: `'detail'` (default) — the vehicle screen;
     *  `'booking'` — straight to the dates step, as if «Забронировать» was
     *  pressed («‹ Назад» still leads to the vehicle screen). */
    initialStep?: 'detail' | 'booking';
    onClose: () => void;
}
/**
 * Vehicle detail + booking modal — mirrors frontend_catalog's flow, reusing the
 * SAME backend endpoints: GET /catalog/vehicles/{id}/ and
 * POST /catalog/booking-requests/. Rendered in a portal to document.body.
 */
declare function VehicleBookingModal({ vehicle, apiBase, locale, botUsername, googleMapsApiKey, referralCode, telegramUser, onTelegramLink, initialFrom, initialTo, unitIds, initialStep, onClose, }: VehicleBookingModalProps): react.ReactPortal;

type CatalogSortOption = 'default' | 'price_asc' | 'price_desc';
/**
 * Live filter state for the standalone-catalog view (`showFilters=true`).
 * `vehicleType: undefined` means "Все" (no type filter, both cars and bikes) —
 * this state is entirely separate from the site's per-block `vehicleType` prop.
 */
interface CatalogFilterState {
    vehicleType?: 'car' | 'motorcycle';
    category?: string;
    search?: string;
    availableFrom?: string;
    availableTo?: string;
    /** Applied after the API has evaluated availability for the selected dates. */
    availableOnly: boolean;
    sort: CatalogSortOption;
}

interface CatalogCategory {
    id: string;
    name: string;
    /** Optional English translation (public catalog/site only) — '' when the
     *  category hasn't been translated in FMS. Use `categoryLabel()` below
     *  rather than reading `name`/`name_en` directly, so every display site
     *  falls back to `name` consistently. */
    name_en?: string;
    color: string;
    /** Present on the /categories/ endpoint only — the nested `category` of a
     *  vehicle omits it. Optional so one interface can truthfully describe both
     *  shapes (no consumer reads it; frontend_site imports this type as the
     *  single source for its SSR preload). */
    vehicle_count?: number;
}
/** Locale-aware category display name — falls back to `name` (ru) when
 *  `name_en` is unset/blank, so an untranslated category never renders empty
 *  on the English catalog. */
declare function categoryLabel(category: Pick<CatalogCategory, 'name' | 'name_en'>, locale: 'ru' | 'en'): string;
interface CatalogVehicle {
    id: string;
    display_name: string;
    brand: string;
    model: string;
    color: string;
    photo_url: string | null;
    vehicle_type: 'car' | 'motorcycle';
    year: number | null;
    category: CatalogCategory | null;
    min_price_per_day: number | null;
    is_available: boolean;
    free_from: string | null;
    free_from_time: string | null;
    /** Server-computed card prices (same calculation as the booking quote).
     *  null/absent (incomplete price list or an older backend) → «по запросу» /
     *  «от N ฿/день» instead of the per-day range and the 7/14/30-day sums. */
    card_prices?: CardPrices | null;
    /** Directory model of the vehicle (`slug` — its page `/<locale>/<cars|bikes>/<slug>`);
     *  null/absent (no published page, older backend) → the card is not a link. */
    vehicle_model?: {
        id: string | number;
        slug: string;
    } | null;
    /** Trim of the model («Premium»); '' / null / absent — none. */
    trim?: string | null;
}
/** Model page of a vehicle — `/ru/cars/zeekr-7x`, `/en/bikes/honda-adv-160`;
 *  undefined when the vehicle has no model slug. */
declare function vehicleModelHref(v: Pick<CatalogVehicle, 'vehicle_type' | 'vehicle_model'>, locale: 'ru' | 'en'): string | undefined;
/** `card_prices` of the public catalog list (decimal strings, as the API sends them). */
interface CardPrices {
    per_day_min: string;
    per_day_max: string;
    quotes: {
        days: number;
        total: string;
    }[];
    /** 30-day discount vs the 1-day rate, whole percent; 0 = no flag. */
    month_discount_pct: number;
}
/**
 * Server-prefetched catalog data the HOST app may pass via Puck render
 * metadata (`metadata.catalogPreload`) so the vehicle grid is present in the
 * initial HTML (SEO: without it search engines index "Загрузка…" instead of
 * the cars). Shape mirrors the two public catalog endpoints; `vehicles` is
 * keyed by vehicle type because the page renders one block per type.
 * The block still refetches on mount — the preload may be minutes old (ISR),
 * availability must end up live.
 */
interface CatalogPreload {
    categories: CatalogCategory[];
    vehicles: Partial<Record<'car' | 'motorcycle', CatalogVehicle[]>>;
}
interface VehicleCatalogProps {
    heading?: string;
    /** Section anchor id so the header nav can scroll here (e.g. "car"). */
    anchorId?: string;
    vehicleType?: 'car' | 'motorcycle';
    /** API origin; '' = relative path (proxied by the host app). */
    apiBase?: string;
    /** Telegram bot username for the quick-booking deep link in the card popup. */
    telegramBot?: string;
    /**
     * Google Maps JS API key for the delivery-address picker in the booking
     * popup (Stage 6, workspace/docs/accessories.md). Infra config, not
     * page content — deliberately NOT a Puck-editable field; defaults to
     * `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (see config.tsx), same
     * pattern as frontend_fms's existing staff-only key. Undefined/empty →
     * the picker degrades to an "unavailable" message, never a broken widget.
     */
    googleMapsApiKey?: string;
    /**
     * Category name preselected on load and shown first in the tab row (e.g.
     * «Премиум» for cars, «Мотоциклы» for bikes). The «Все» tab is always last.
     * Empty / not found → «Все» is preselected. Ignored when `showFilters` is on
     * (the filter bar's own category picker takes over).
     */
    defaultCategory?: string;
    /**
     * Explicit locale override — takes priority over Puck's injected page
     * metadata locale (`puck.metadata.locale`). Needed by non-Puck hosts (e.g.
     * the standalone catalog's Vite shell), which never pass a `puck` prop at
     * all and so have no metadata locale to fall back on.
     */
    locale?: 'ru' | 'en';
    /**
     * Renders a full filter bar (type/category/search/availability date-range/
     * sort) above the grid, REPLACING the plain category-tab row. Off by
     * default — the site uses two fixed-type blocks (cars/bikes) with simple
     * tabs; the standalone catalog app (one block, all vehicle types, user
     * picks the type via the filter bar) turns this on. See
     * workspace/docs/puck-blocks.md.
     */
    showFilters?: boolean;
    /**
     * Agent/referral attribution code (`?ref=`) — captured and persisted by the
     * HOST app (see frontend_catalog's useReferralCode). This component never
     * reads the URL/localStorage itself; the code is threaded into the booking
     * payload, the Telegram deep link, and the share link (VehicleBookingModal).
     */
    referralCode?: string | null;
    /**
     * Telegram Mini App user (from the host's `window.Telegram.WebApp.initData`)
     * — this component never reads `window.Telegram` itself. Used to prefill
     * the booking form (VehicleBookingModal).
     */
    telegramUser?: TelegramCatalogUser | null;
    /**
     * Host handoff for the "1-click via Telegram" deep link, forwarded to
     * VehicleBookingModal. Inside a Telegram Mini App the host passes
     * `window.Telegram.WebApp.openTelegramLink`; omitted elsewhere (the modal
     * then opens the link in a new tab). Keeps this component framework-neutral.
     */
    onTelegramLink?: (url: string) => void;
}
declare const STRINGS: {
    readonly ru: {
        readonly all: "Все";
        readonly from: "от";
        readonly perDayUnit: "฿/день";
        readonly perDay: "в сутки";
        readonly days: (n: number) => string;
        readonly book: "Забронировать";
        readonly share: "Поделиться";
        readonly linkCopied: "Ссылка скопирована";
        readonly busy: "занято";
        readonly freeFrom: "свободно с";
        readonly onRequest: "по запросу";
        readonly available: "свободно";
        readonly units: (n: number, kind?: CatalogVehicle["vehicle_type"]) => string;
        readonly viewAll: "Смотреть весь каталог";
        readonly empty: "Нет доступных вариантов";
        readonly loading: "Загрузка…";
        readonly error: "Не удалось загрузить каталог";
        readonly cars: "Авто";
        readonly motorcycles: "Мото";
        readonly category: "Категория";
        readonly search: "Поиск...";
        readonly sortDefault: "Сортировка";
        readonly sortPriceAsc: "Дешевле";
        readonly sortPriceDesc: "Дороже";
        readonly dateFrom: "Начало";
        readonly dateTo: "Окончание";
        readonly availabilityTitle: "Даты аренды";
        readonly availabilityPrompt: "Без дат показываем доступность на сегодня";
        readonly availabilityReady: "Доступность рассчитана на выбранный период";
        readonly availabilityAction: "Показать свободные";
        readonly availabilityActionPending: "Выберите даты";
        readonly editDates: "Изменить";
        readonly doneDates: "Готово";
        readonly closeDatePicker: "Закрыть календарь";
        readonly availableOnly: "Только свободные";
        readonly availableToday: "Свободно сегодня";
        readonly availableSelected: "Свободно";
        readonly clearFilters: "Сбросить фильтры";
    };
    readonly en: {
        readonly all: "All";
        readonly from: "from";
        readonly perDayUnit: "฿/day";
        readonly perDay: "per day";
        readonly days: (n: number) => string;
        readonly book: "Book";
        readonly share: "Share";
        readonly linkCopied: "Link copied";
        readonly busy: "busy";
        readonly freeFrom: "free from";
        readonly onRequest: "on request";
        readonly available: "available";
        readonly units: (n: number, kind?: CatalogVehicle["vehicle_type"]) => string;
        readonly viewAll: "View full catalog";
        readonly empty: "No vehicles available";
        readonly loading: "Loading…";
        readonly error: "Failed to load catalog";
        readonly cars: "Cars";
        readonly motorcycles: "Motorcycles";
        readonly category: "Category";
        readonly search: "Search...";
        readonly sortDefault: "Sort";
        readonly sortPriceAsc: "Cheapest";
        readonly sortPriceDesc: "Priciest";
        readonly dateFrom: "Start date";
        readonly dateTo: "End date";
        readonly availabilityTitle: "Rental dates";
        readonly availabilityPrompt: "Without dates, availability is shown for today";
        readonly availabilityReady: "Availability is calculated for your dates";
        readonly availabilityAction: "Show available";
        readonly availabilityActionPending: "Choose dates";
        readonly editDates: "Change";
        readonly doneDates: "Done";
        readonly closeDatePicker: "Close calendar";
        readonly availableOnly: "Available only";
        readonly availableToday: "Available today";
        readonly availableSelected: "Available";
        readonly clearFilters: "Clear filters";
    };
};
interface VehicleGroup {
    /** Representative unit (`pickRepresentative`), availability of the group. */
    vehicle: CatalogVehicle;
    /** Every unit of the group, incoming order. */
    units: CatalogVehicle[];
    total: number;
    availableCount: number;
}
/** One card = one model: identical units share brand/model/year/colour. The
 *  SAME key decides which units' availability the booking calendar merges. */
declare function vehicleGroupKey(v: Pick<CatalogVehicle, 'brand' | 'model' | 'year' | 'color'>): string;
type RepresentativeLike = Pick<CatalogVehicle, 'is_available' | 'free_from' | 'min_price_per_day'>;
/**
 * The unit that stands for a group (catalog card, model-page card, trim):
 * free today → the cheapest of the free ones; none free → the one freed
 * earliest (units with a date first), then the cheaper. Ties keep the incoming
 * order. The ONE rule for the home catalog and the model / category pages.
 */
declare function pickRepresentative<T extends RepresentativeLike>(group: readonly T[]): T;
/**
 * Units grouped into cards (a representative + a count, not one card per
 * physical unit), mirroring frontend_catalog. `keyFn` decides the group: the
 * home catalog — `vehicleGroupKey` (brand/model/year/colour), the site pages —
 * the model of the directory.
 */
declare function groupVehicles(vehicles: readonly CatalogVehicle[], keyFn?: (v: CatalogVehicle) => string): VehicleGroup[];
/**
 * Card order of the tab grids (the site's cars/bikes sections, category and
 * type pages): models with a unit free today first, then the cheaper
 * `min_price_per_day` (no price — last), then the incoming order (stable).
 * The filter-bar mode (`showFilters`) keeps its own sort and does not use it.
 */
declare function orderCatalogCards<T extends {
    vehicle: Pick<CatalogVehicle, 'min_price_per_day'>;
    availableCount: number;
}>(cards: readonly T[]): T[];
type PuckInjected = {
    puck?: {
        metadata?: {
            locale?: string;
            catalogPreload?: CatalogPreload;
        };
    };
};
/**
 * Live vehicle catalog section. Fetches vehicles + categories from the public
 * FMS catalog API (single source of truth), groups identical units into one
 * card (like frontend_catalog), with a per-section category filter. Used twice
 * (cars / bikes). Locale comes from Puck metadata (page locale).
 */
declare function VehicleCatalog({ heading, anchorId, vehicleType, apiBase, telegramBot, googleMapsApiKey, defaultCategory, locale: localeProp, showFilters, referralCode, telegramUser, onTelegramLink, puck, }: VehicleCatalogProps & PuckInjected): react.JSX.Element;

interface MapContactsProps {
    /** Section anchor id (e.g. "contacts"). */
    anchorId?: string;
    heading?: string;
    /** Google Maps EMBED url (the `…/maps/embed?pb=…` iframe src). */
    mapEmbedUrl?: string;
    phone?: string;
    email?: string;
    address?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
}
/**
 * Contacts on a full-width Google Map with a dark info card overlaid on the
 * left — mirrors the original site's contacts section.
 */
declare function MapContacts({ anchorId, heading, mapEmbedUrl, phone, email, address, whatsapp, telegram, instagram, }: MapContactsProps): react.JSX.Element;

/** Props for every editable component, keyed by component name. */
interface Props {
    Hero: HeroProps;
    RichText: RichTextProps;
    StatCounters: StatCountersProps;
    AboutPromo: AboutPromoProps;
    FeatureCards: FeatureCardsProps;
    TermsAccordion: TermsAccordionProps;
    ReviewsCarousel: ReviewsCarouselProps;
    SiteHeader: SiteHeaderProps;
    Footer: FooterProps;
    LeadForm: LeadFormProps;
    VehicleCatalog: VehicleCatalogProps;
    MapContacts: MapContactsProps;
}
/** Page-level (root) fields — drive SEO metadata, not visible layout. */
interface RootProps {
    title?: string;
    description?: string;
    ogImage?: string;
    favicon?: string;
}
declare const puckConfig: Config;

type ContactKind = 'phone' | 'whatsapp' | 'telegram' | 'instagram';
interface ContactIconProps {
    kind: ContactKind;
    className?: string;
}
/** Compact inline icon for a contact channel. */
declare function ContactIcon({ kind, className }: ContactIconProps): react.JSX.Element;

/** Card strings — a subset of `STRINGS` in VehicleCatalog.tsx (ru + en there). */
interface VehicleCardStrings {
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
interface VehicleCardProps {
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
declare function formatCardDate(iso: string, locale: 'ru' | 'en'): string;
/**
 * Catalog card (approved 2026-11-04): 4:5 photo with the name on top and
 * «status — per-day range» + 7/14/30-day sums at the bottom, then a strip with
 * «Забронировать» and «Поделиться». Every size scales with the card width
 * (container queries, `--sb-vcard-u` in styles.css). Prices come from the
 * server (`card_prices`) — no arithmetic here.
 */
declare function VehicleCard({ vehicle: v, total, availableCount, categoryName, hasCompleteDateRange, locale, strings: t, referralCode, onOpen, href, }: VehicleCardProps): react.JSX.Element;

/**
 * Parts shared by the catalog card (`VehicleCard`) and the cover of the vehicle
 * window (`VehicleBookingModal`, «детали»): the name block and the bottom
 * overlay «status — per-day range» + 7/14/30-day sums. Classes are the card's
 * (`sb-vcard__*`); every size is `N * --sb-vcard-u`, which the card scales with
 * its width and the window pins to 1px. Prices come from the server
 * (`card_prices`) — no arithmetic here beyond rounding up to whole baht.
 */
type CardStatusTone = 'available' | 'free' | 'busy';
/** A subset of `STRINGS` in VehicleCatalog.tsx (ru + en there). */
interface CardPriceOverlayStrings {
    from: string;
    /** «฿/день» — unit of the from-price fallback (no `card_prices`). */
    perDayUnit: string;
    /** «в сутки» — caption of the per-day range. */
    perDay: string;
    onRequest: string;
    days: (n: number) => string;
}
interface CardPriceOverlayProps {
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
declare function CardPriceOverlay({ statusText, statusTone, prices, minPricePerDay, strings: t, dimmed, statusSlot, }: CardPriceOverlayProps): react.JSX.Element;
/** Name + «год · категория» — top of the card photo and of the window cover. */
declare function CardTitle({ name, year, categoryName, stepTitle, }: {
    name: string;
    year: number | null | undefined;
    categoryName: string | null;
    /** The window's «детали» step: the name is the step title that takes focus
     *  on a step change (VehicleBookingModal). */
    stepTitle?: boolean;
}): react.JSX.Element;

/**
 * Цена дня для клиента: до сотых, без хвостовых нулей у ровной цены.
 * 1833.333333 → "1 833.33", 2000 → "2 000", 1833.5 → "1 833.50" (группы —
 * неразрывным пробелом).
 *
 * Копейки показываем честно: цена дня последнего тарифа часто получена
 * делением суммы за 30 дней (55 000 / 30), и округление до целого давало бы
 * на экране «30 × 1,833 = 55,000», что не сходится.
 */
declare function formatDayPrice(value: number): string;
/**
 * An exact money amount of the window («Стоимость», «Итого» of the success
 * screen, deposits): up to satang, no trailing zeros, groups split by a
 * non-breaking space. 41245 → «41 245», "300.50" → «300.5». Empty for
 * nothing / not a number.
 */
declare function formatMoney(value: string | number | null | undefined): string;
/**
 * Whole baht, ALWAYS rounded up (owner 2026-11-04): 1666.01 → «1 667»,
 * 2000 → «2 000». Groups are split by a non-breaking space so a price never
 * wraps. The epsilon keeps a float that is whole in fact (2000.0000000001
 * after a division on the server side) from being bumped to the next baht.
 * Used by the card and the vehicle window (per-day range, 7/14/30-day sums,
 * the season price grid); the booking «Стоимость» block keeps exact sums.
 */
declare function formatBahtCeil(value: number | string): string;

/** `CatalogModelCategorySerializer` — category of a model page. */
interface CatalogModelPageCategory {
    id: string;
    slug: string;
    name: string;
    /** '' when the category is not translated — use `categoryLabel()`. */
    name_en: string;
}
/** `CatalogModelPageSerializer` — a row of `GET /catalog/models/`. */
interface CatalogModelPage {
    slug: string;
    brand: string;
    name: string;
    /** «Zeekr 009» — what the page calls the model. */
    label: string;
    vehicle_type: CatalogVehicle['vehicle_type'];
    category: CatalogModelPageCategory | null;
    photo_url: string | null;
    /** Decimal string — `card_prices.per_day_min` of the representative unit. */
    price_from_per_day: string | null;
    /** Shortest rental (days) that gets `price_from_per_day`. */
    price_from_min_days: number | null;
    vehicle_count: number;
    available_today_count: number;
    has_text_ru: boolean;
    has_text_en: boolean;
    updated_at: string;
}
/** `CatalogImageSerializer` — an image of the vehicle gallery. */
interface CatalogGalleryImage {
    image_url: string | null;
    /** 400px variant. */
    thumb_url: string | null;
    /** 1280px variant. */
    display_url: string | null;
    position: number;
}
/** A unit of the model page — exactly the vehicle detail response
 *  (`CatalogVehicleDetailSerializer`, with `trim`). */
interface CatalogModelUnit extends Omit<CatalogVehicleDetail, 'gallery_images'> {
    gallery_images?: CatalogGalleryImage[];
}
/** `CatalogModelPageDetailSerializer` — `GET /catalog/models/<type>/<slug>/`. */
interface CatalogModelPageDetail extends CatalogModelPage {
    description_ru: string;
    description_en: string;
    meta_description_ru: string;
    meta_description_en: string;
    units: CatalogModelUnit[];
    similar: CatalogModelPage[];
}
/** Old model address — the site answers 308 to `redirect_to`. */
interface CatalogModelRedirect {
    redirect_to: string;
}
/** `CatalogCategoryPageSerializer` — a row of `GET /catalog/categories/`. */
interface CatalogCategoryPage extends CatalogCategory {
    slug: string;
    h1: string;
    h1_en: string;
    intro: string;
    intro_en: string;
    meta_description: string;
    meta_description_en: string;
    section: 'cars' | 'bikes';
    /** Indexed page: ≥3 models with visible units + Russian h1 and intro. */
    is_published: boolean;
    has_text_ru: boolean;
    has_text_en: boolean;
}
/** One link of the breadcrumbs; no `href` — the current page. */
interface Crumb {
    label: string;
    href?: string;
}

/** One trim of a model: its units, the unit that stands for it. */
interface ModelVersion {
    /** Normalised trim ('' — no trim). */
    key: string;
    /** Trim as written in FMS ('' — no trim). */
    trim: string;
    /** Units of the trim, incoming order. */
    units: CatalogModelUnit[];
    /** The unit that stands for the trim (`pickRepresentative`). */
    unit: CatalogModelUnit;
    availableCount: number;
}
/** Trims of a model: no trim («Базовая») first, then alphabetically. */
declare function buildVersions(units: readonly CatalogModelUnit[]): ModelVersion[];
/** The trim shown first: the one with a unit free today, else freed earliest. */
declare function defaultVersion(versions: readonly ModelVersion[]): ModelVersion | null;
/** Switcher caption: the trim, or «Базовая»/«Standard». */
declare function trimLabel(trim: string, baseLabel: string): string;
/** Line under the trim caption: seats when the trims differ by them, else the year. */
declare function versionSubtitle(version: ModelVersion, versions: readonly ModelVersion[], seatsCount: (n: number) => string): string;
/**
 * Shortest rental that gets the unit's lowest per-day price: the period of the
 * current season (`pricing_seasons`) priced at `card_prices.per_day_min`. Not
 * found (older backend, no seasons) — the model row's `price_from_min_days`
 * when this unit carries the model's «from» price.
 */
declare function priceFromMinDays(unit: CatalogModelUnit, today: string, model?: Pick<CatalogModelPage, 'price_from_per_day' | 'price_from_min_days'>): number | null;
/** Price block of a trim: «от N ฿ / сутки», its rental condition and the
 *  1-day price — all from the server (`card_prices`), rounded up to baht. */
interface VersionPrice {
    /** Lowest per-day price, formatted («4 334»); null — on request. */
    from: string | null;
    /** 1-day (highest) per-day price; null when it equals `from` or is unknown. */
    maxDay: string | null;
    /** Shortest rental that gets `from`. */
    minDays: number | null;
}
declare function versionPrice(unit: CatalogModelUnit, today: string, model?: Pick<CatalogModelPage, 'price_from_per_day' | 'price_from_min_days'>): VersionPrice;

/** What the HOST passes to open the booking window (same props the catalog
 *  block forwards to `VehicleBookingModal`). */
type PageBookingConfig = Pick<VehicleBookingModalProps, 'apiBase' | 'botUsername' | 'googleMapsApiKey' | 'referralCode' | 'telegramUser' | 'onTelegramLink'>;
interface ModelPageState {
    model: CatalogModelPageDetail;
    locale: 'ru' | 'en';
    /** Phuket day (ISO) the prices and seasons are read for. */
    today: string;
    versions: ModelVersion[];
    selected: ModelVersion | null;
    select: (key: string) => void;
    /** Opens the booking window (dates step) for the selected trim. */
    openBooking: () => void;
}
/** The model page state, or null outside `ModelPageProvider`. */
declare function useModelPage(): ModelPageState | null;
interface ModelPageProviderProps {
    model: CatalogModelPageDetail;
    locale: 'ru' | 'en';
    booking: PageBookingConfig;
    /** ISO day for prices/seasons; default — today on Phuket. */
    today?: string;
    children: ReactNode;
}
/**
 * Shared state of a model page: the chosen trim (hero switcher, «Выбрать» of
 * the trims, the mobile bar, the season prices) and the booking window, which
 * opens straight on the dates step for the chosen trim's units.
 */
declare function ModelPageProvider({ model, locale, booking, today, children }: ModelPageProviderProps): react.JSX.Element;

/** Anchor of the hero — «Выбрать» of the trims scrolls back here. */
declare const MODEL_HERO_ID = "sb-model-hero";
interface ModelHeroProps {
    /** Breadcrumbs above the hero (published links only — the host decides). */
    crumbs?: Crumb[];
    /** «Задать вопрос» links — from the site's contacts, not literals. */
    telegramUrl?: string;
    whatsappUrl?: string;
}
/**
 * First screen of a model page (approved mockup): gallery on the left, the
 * booking card on the right — tags, h1, trim switcher, «from» price with its
 * rental condition, status, 7/14/30-day sums, deposit, «Забронировать» and
 * «Задать вопрос». Needs `ModelPageProvider`.
 */
declare function ModelHero({ crumbs, telegramUrl, whatsappUrl }: ModelHeroProps): react.JSX.Element | null;

interface ModelOverviewProps {
    /** «О модели» — plain text, paragraphs split by a blank line. */
    about: string;
    /** Specs of the four key figures; default — the chosen trim of `ModelPageProvider`. */
    specs?: VehicleSpecs;
    /** Small line above the heading; default — the model name. */
    eyebrow?: string;
    locale?: 'ru' | 'en';
}
/**
 * «О модели»: the four key figures in one 2×2 card + the model text. On
 * ≤1024px the text goes above the figures (styles.css).
 */
declare function ModelOverview({ about, specs, eyebrow, locale: localeProp }: ModelOverviewProps): react.JSX.Element | null;

interface SpecGroupsProps {
    /** Default — the chosen trim of `ModelPageProvider`. */
    specs?: VehicleSpecs;
    /** Small line above the heading; default — the model name. */
    eyebrow?: string;
    locale?: 'ru' | 'en';
}
/**
 * «Характеристики»: three columns — engine and range / performance / body and
 * interior — over `buildSpecRows` (values and units only from there). Columns
 * share one height; an empty row or column is not drawn.
 */
declare function SpecGroups({ specs, eyebrow, locale: localeProp }: SpecGroupsProps): react.JSX.Element | null;

/**
 * «Комплектации»: a card per trim — photo, seats, per-day range, 30 days,
 * when it is free — and «Выбрать», which switches the hero to that trim and
 * scrolls back to it. Renders nothing when the model has one trim.
 */
declare function TrimCompare({ eyebrow }: {
    eyebrow?: string;
}): react.JSX.Element | null;

interface ModelGridProps {
    /** Public catalog list (`GET /catalog/vehicles/?vehicle_type=`). */
    vehicles: CatalogVehicle[];
    locale: 'ru' | 'en';
    booking: PageBookingConfig;
    /** Only these models (slugs) — e.g. the similar models of a model page. */
    onlySlugs?: string[];
    /** Only this category. */
    categoryId?: string;
    /** At most this many cards. */
    limit?: number;
    /** Category on the cards (off on a category page — every card is it). */
    showCategory?: boolean;
}
/**
 * Grid of catalog cards, one per model (category and type pages, similar
 * models). Order — `orderCatalogCards` (free today → cheaper). Each card links
 * to its model page (`href`, crawlable), a plain click opens the vehicle window
 * in place — as on the home page.
 */
declare function ModelGrid({ vehicles, locale, booking, onlySlugs, categoryId, limit, showCategory, }: ModelGridProps): react.JSX.Element | null;

interface CategoryHeaderProps {
    locale: 'ru' | 'en';
    /** Section of the page — its categories only. */
    section: 'cars' | 'bikes';
    h1: string;
    crumbs?: Crumb[];
    /** Models of THIS page (the whole type on a type page). */
    models: CatalogModelPage[];
    /** Models of the section, for the category counters; default — `models`. */
    sectionModels?: CatalogModelPage[];
    /** `GET /catalog/categories/` — only the published ones of `section` are linked. */
    categories: CatalogCategoryPage[];
    /** Slug of the current category (its chip is highlighted); none — type page. */
    currentSlug?: string;
}
/**
 * Top of a category / type page: breadcrumbs, h1 (wraps balanced, never cut), the
 * figures line (models · from N ฿/day for M+ days · free today) and a row of
 * links to the PUBLISHED categories of the section with model counters.
 */
declare function CategoryHeader({ locale, section, h1, crumbs, models, sectionModels, categories, currentSlug, }: CategoryHeaderProps): react.JSX.Element;

/**
 * Bottom bar of a model page on phones (≤640px, styles.css): «от N ฿ / сутки»,
 * a round Telegram button and «Забронировать». Fixed to the bottom with the
 * safe-area inset; a spacer of the same height (also phone-only) keeps the end
 * of the page from hiding under it — nothing moves when it shows. Needs
 * `ModelPageProvider`.
 */
declare function MobileBookingBar({ telegramUrl }: {
    telegramUrl?: string;
}): react.JSX.Element | null;

/** «Главная / Автомобили / Zeekr 009» — the last crumb (no `href`) is the page. */
declare function Breadcrumbs({ crumbs, locale }: {
    crumbs: Crumb[];
    locale: 'ru' | 'en';
}): react.JSX.Element | null;

/** Strings of the model / category page components (ru + en). */
declare const PAGE_STRINGS: {
    readonly ru: {
        readonly rentInPhuket: "аренда на Пхукете";
        readonly baseTrim: "Базовая";
        readonly trims: "Комплектации";
        readonly seatsCount: (n: number) => string;
        readonly from: "от";
        readonly perDay: "/ сутки";
        readonly priceNote: (minDays: number | null, maxDay: string | null) => string;
        readonly onRequest: "Цена по запросу";
        readonly days: (n: number) => string;
        readonly deposit: "Депозит";
        readonly or: "или";
        readonly book: "Забронировать";
        readonly ask: "Задать вопрос";
        readonly trust: readonly ["Подача за 2 часа", "Официальный договор", "Поддержка на русском"];
        readonly statusFree: "Свободна сейчас";
        readonly statusFreesOn: (date: string) => string;
        readonly gallery: "Фото";
        readonly prevPhoto: "Предыдущее фото";
        readonly nextPhoto: "Следующее фото";
        readonly photoN: (n: number) => string;
        readonly breadcrumbs: "Навигационная цепочка";
        readonly about: "О модели";
        readonly keyFacts: "Главное";
        readonly factRangeEv: "на одном заряде";
        readonly factRange: "запас хода";
        readonly factConsumption: "расход";
        readonly factPower: "мощность";
        readonly factSprint: "до 100 км/ч";
        readonly factSeats: "мест в салоне";
        readonly specs: "Характеристики";
        readonly groupEngine: "Двигатель и запас хода";
        readonly groupDynamics: "Динамика";
        readonly groupBody: "Кузов и салон";
        readonly seatsRow: "Мест";
        readonly perDayRow: "В сутки";
        readonly monthRow: "30 дней";
        readonly freeRow: "Свободна";
        readonly freeNow: "сейчас";
        readonly freeFrom: (date: string) => string;
        readonly busy: "занята";
        readonly choose: "Выбрать";
        readonly chosen: "Выбрана";
        readonly modelsCount: (n: number) => string;
        readonly statsPrice: (minDays: number | null) => string;
        readonly statsFree: (n: number) => string;
        readonly categories: "Категории";
    };
    readonly en: {
        readonly rentInPhuket: "rental in Phuket";
        readonly baseTrim: "Standard";
        readonly trims: "Trims";
        readonly seatsCount: (n: number) => string;
        readonly from: "from";
        readonly perDay: "/ day";
        readonly priceNote: (minDays: number | null, maxDay: string | null) => string;
        readonly onRequest: "Price on request";
        readonly days: (n: number) => string;
        readonly deposit: "Deposit";
        readonly or: "or";
        readonly book: "Book";
        readonly ask: "Ask a question";
        readonly trust: readonly ["Delivery in 2 hours", "Official rental contract", "Support in Russian and English"];
        readonly statusFree: "Available now";
        readonly statusFreesOn: (date: string) => string;
        readonly gallery: "Photos";
        readonly prevPhoto: "Previous photo";
        readonly nextPhoto: "Next photo";
        readonly photoN: (n: number) => string;
        readonly breadcrumbs: "Breadcrumbs";
        readonly about: "About the model";
        readonly keyFacts: "Key facts";
        readonly factRangeEv: "on one charge";
        readonly factRange: "range";
        readonly factConsumption: "consumption";
        readonly factPower: "power";
        readonly factSprint: "0–100 km/h";
        readonly factSeats: "seats";
        readonly specs: "Specifications";
        readonly groupEngine: "Engine and range";
        readonly groupDynamics: "Performance";
        readonly groupBody: "Body and interior";
        readonly seatsRow: "Seats";
        readonly perDayRow: "Per day";
        readonly monthRow: "30 days";
        readonly freeRow: "Available";
        readonly freeNow: "now";
        readonly freeFrom: (date: string) => string;
        readonly busy: "booked";
        readonly choose: "Choose";
        readonly chosen: "Chosen";
        readonly modelsCount: (n: number) => string;
        readonly statsPrice: (minDays: number | null) => string;
        readonly statsFree: (n: number) => string;
        readonly categories: "Categories";
    };
};

export { AboutPromo, type AboutPromoProps, Breadcrumbs, STRINGS as CATALOG_STRINGS, CardPriceOverlay, type CardPriceOverlayProps, type CardPriceOverlayStrings, type CardPrices, type CardStatusTone, CardTitle, type CatalogCategory, type CatalogCategoryPage, type CatalogFilterState, type CatalogGalleryImage, type CatalogModelPage, type CatalogModelPageCategory, type CatalogModelPageDetail, type CatalogModelRedirect, type CatalogModelUnit, type CatalogPreload, type CatalogSortOption, type CatalogVehicle, type CatalogVehicleDetail, CategoryHeader, type CategoryHeaderProps, ContactIcon, type ContactKind, type Crumb, FeatureCards, type FeatureCardsProps, type FeatureItem, Footer, type FooterProps, Hero, type HeroProps, LanguageSwitcher, type LanguageSwitcherProps, LeadForm, type LeadFormProps, MODEL_HERO_ID, MapContacts, type MapContactsProps, type MediaReview, MobileBookingBar, ModelGrid, type ModelGridProps, ModelHero, type ModelHeroProps, ModelOverview, type ModelOverviewProps, ModelPageProvider, type ModelPageProviderProps, type ModelPageState, type ModelVersion, type NavLink, PAGE_STRINGS, type PageBookingConfig, PriceGrid, type PriceGridProps, type PricingPeriod, type PricingSeason, type Props, ReviewsCarousel, type ReviewsCarouselProps, RichText, type RichTextProps, type RootProps, SiteHeader, type SiteHeaderProps, type SiteLocale, SpecGroups, type SpecGroupsProps, type SpecRow, StatCounters, type StatCountersProps, type StatItem, type TelegramCatalogUser, type TermItem, TermsAccordion, type TermsAccordionProps, type TextReview, TrimCompare, VehicleBookingModal, type VehicleBookingModalProps, VehicleCard, type VehicleCardProps, type VehicleCardStrings, VehicleCatalog, type VehicleCatalogProps, type VehicleGroup, type VehicleSpecs, type VersionPrice, buildSpecRows, buildVersions, categoryLabel, defaultVersion, formatBahtCeil, formatCardDate, formatDayPrice, formatMoney, groupVehicles, isCurrentSeason, orderCatalogCards, periodLabel, pickRepresentative, priceFromMinDays, puckConfig, seasonLabel, trimLabel, useModelPage, vehicleGroupKey, vehicleModelHref, versionPrice, versionSubtitle, withLinkBase };
