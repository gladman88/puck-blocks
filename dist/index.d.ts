import { Config } from '@puckeditor/core';
import * as react from 'react';

interface HeroProps {
    heading: string;
    subheading?: string;
    /** Optional background image URL. */
    backgroundImage?: string;
    ctaLabel?: string;
    ctaHref?: string;
}
/**
 * Full-bleed hero. Framework-neutral plain HTML; styled by the shipped
 * design-system CSS (`.sb-*`), so it renders identically in the editor and on
 * the live site.
 */
declare function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }: HeroProps): react.JSX.Element;

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
/** Row of stat/advantage cards (big accent number + description). */
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
}
/** Grid of icon + title + text feature cards. */
declare function FeatureCards({ heading, items }: FeatureCardsProps): react.JSX.Element;

interface TermItem {
    title: string;
    content?: string;
}
interface TermsAccordionProps {
    heading?: string;
    items: TermItem[];
}
/** Collapsible terms/conditions (native <details>, no JS, accessible). */
declare function TermsAccordion({ heading, items }: TermsAccordionProps): react.JSX.Element;

interface ReviewItem {
    /** Reviewer name. */
    name?: string;
    /** 1–5 stars. */
    rating?: number;
    /** Review text. */
    text?: string;
    /** Reviewer avatar image URL. */
    avatar?: string;
    /** Review photo / screenshot image URL (shown when there is no video). */
    photo?: string;
    /** Video review link (YouTube preferred — embeds inline). */
    videoUrl?: string;
}
interface ReviewsCarouselProps {
    heading?: string;
    /** Section anchor id so the header nav can scroll here (e.g. "reviews"). */
    anchorId?: string;
    reviews?: ReviewItem[];
}
/**
 * Reviews as a responsive grid of cards. Each card is one cohesive review —
 * name + rating + text and, optionally, an inline video (YouTube) or photo —
 * instead of disconnected "text reviews" and "video reviews" sections.
 */
declare function ReviewsCarousel({ heading, anchorId, reviews }: ReviewsCarouselProps): react.JSX.Element;

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

interface FooterProps {
    phone?: string;
    email?: string;
    whatsapp?: string;
    telegram?: string;
    instagram?: string;
    mapUrl?: string;
    links: NavLink[];
    note?: string;
}
/** Footer: contacts + nav + socials. */
declare function Footer({ phone, email, whatsapp, telegram, instagram, mapUrl, links, note, }: FooterProps): react.JSX.Element;

interface LeadFormProps {
    heading?: string;
    text?: string;
    buttonLabel?: string;
    successMessage?: string;
    /** Backend endpoint that receives { name, phone, contact_method }. */
    endpoint?: string;
}
/**
 * Lead/booking form. Client-interactive (manages its own state), posts JSON to
 * `endpoint`. With no endpoint configured it just shows the success message
 * (useful in the editor preview). The whole tree renders inside a client
 * boundary on the site, so this needs no framework-specific directive.
 */
declare function LeadForm({ heading, text, buttonLabel, successMessage, endpoint, }: LeadFormProps): react.JSX.Element;

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
    vehicleType?: 'car' | 'motorcycle';
    /** API origin; '' = relative path (proxied by the host app). */
    apiBase?: string;
    /** Link to the full catalog app (card click + "view all"). */
    catalogUrl?: string;
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
declare function VehicleCatalog({ heading, vehicleType, apiBase, catalogUrl, puck, }: VehicleCatalogProps & PuckInjected): react.JSX.Element;

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
}
/** Page-level (root) fields — drive SEO metadata, not visible layout. */
interface RootProps {
    title?: string;
    description?: string;
    ogImage?: string;
}
declare const puckConfig: Config;

export { AboutPromo, type AboutPromoProps, type CatalogCategory, type CatalogVehicle, FeatureCards, type FeatureCardsProps, type FeatureItem, Footer, type FooterProps, Hero, type HeroProps, LeadForm, type LeadFormProps, type NavLink, type Props, type ReviewItem, ReviewsCarousel, type ReviewsCarouselProps, RichText, type RichTextProps, type RootProps, SiteHeader, type SiteHeaderProps, StatCounters, type StatCountersProps, type StatItem, type TermItem, TermsAccordion, type TermsAccordionProps, VehicleCatalog, type VehicleCatalogProps, puckConfig };
