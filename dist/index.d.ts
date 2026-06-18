import { Config } from '@puckeditor/core';
import * as react from 'react';

interface HeroProps {
    heading: string;
    /** Word/phrase inside `heading` to highlight in the accent colour (gold). */
    accentWord?: string;
    subheading?: string;
    /** Optional background image URL. */
    backgroundImage?: string;
    ctaLabel?: string;
    ctaHref?: string;
    /** Optional round social buttons shown next to the CTA. */
    whatsapp?: string;
    telegram?: string;
}
/**
 * Full-bleed hero — content left-aligned over a darkened background image, with
 * an uppercase heading (one word accented) and a CTA row that can carry round
 * WhatsApp/Telegram buttons. Framework-neutral; styled by the shipped CSS.
 */
declare function Hero({ heading, accentWord, subheading, backgroundImage, ctaLabel, ctaHref, whatsapp, telegram, }: HeroProps): react.JSX.Element;

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
declare function AboutPromo({ heading, text, image, videoUrl, imagePosition, }: AboutPromoProps): react.JSX.Element;

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
declare function FeatureCards({ heading, items, videoUrl, videoIndex }: FeatureCardsProps): react.JSX.Element;

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
}
/**
 * Reviews section with TWO independent carousels: text testimonials (cards with
 * avatar + stars + text) and media reviews (portrait video / photo). Mirrors
 * the original site, where the two are separate rows.
 */
declare function ReviewsCarousel({ heading, anchorId, textReviews, mediaReviews }: ReviewsCarouselProps): react.JSX.Element;

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
}
/** Sticky, blurred dark header: brand + anchor nav + contact icon links. */
declare function SiteHeader({ logoText, logoImage, links, phone, whatsapp, telegram, instagram, }: SiteHeaderProps): react.JSX.Element;

interface FooterColumn {
    title: string;
    /** Optional link for the column heading itself (e.g. «Отзывы» → #reviews). */
    titleHref?: string;
    links?: NavLink[];
}
interface FooterProps {
    logoText?: string;
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
}
/** Multi-column footer: wordmark + nav columns + a contacts column. */
declare function Footer({ logoText, note, columns, contactsTitle, phone, email, address, whatsapp, telegram, instagram, }: FooterProps): react.JSX.Element;

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

interface CatalogCategory {
    id: string;
    name: string;
    color: string;
    vehicle_count: number;
}
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
}
interface VehicleCatalogProps {
    heading?: string;
    /** Section anchor id so the header nav can scroll here (e.g. "car"). */
    anchorId?: string;
    vehicleType?: 'car' | 'motorcycle';
    /** API origin; '' = relative path (proxied by the host app). */
    apiBase?: string;
    /** Link to the full catalog app (card click + "view all"). */
    catalogUrl?: string;
    /**
     * Category name preselected on load and shown first in the tab row (e.g.
     * «Премиум» for cars, «Мотоциклы» for bikes). The «Все» tab is always last.
     * Empty / not found → «Все» is preselected.
     */
    defaultCategory?: string;
}
type PuckInjected = {
    puck?: {
        metadata?: {
            locale?: string;
        };
    };
};
/**
 * Live vehicle catalog section. Fetches vehicles + categories from the public
 * FMS catalog API (single source of truth), groups identical units into one
 * card (like frontend_catalog), with a per-section category filter. Used twice
 * (cars / bikes). Locale comes from Puck metadata (page locale).
 */
declare function VehicleCatalog({ heading, anchorId, vehicleType, apiBase, catalogUrl, defaultCategory, puck, }: VehicleCatalogProps & PuckInjected): react.JSX.Element;

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
}
declare const puckConfig: Config;

export { AboutPromo, type AboutPromoProps, type CatalogCategory, type CatalogVehicle, FeatureCards, type FeatureCardsProps, type FeatureItem, Footer, type FooterProps, Hero, type HeroProps, LeadForm, type LeadFormProps, MapContacts, type MapContactsProps, type MediaReview, type NavLink, type Props, ReviewsCarousel, type ReviewsCarouselProps, RichText, type RichTextProps, type RootProps, SiteHeader, type SiteHeaderProps, StatCounters, type StatCountersProps, type StatItem, type TermItem, TermsAccordion, type TermsAccordionProps, type TextReview, VehicleCatalog, type VehicleCatalogProps, puckConfig };
