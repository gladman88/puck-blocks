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
    imagePosition?: 'left' | 'right';
}
/** Image + headline promo block (2-col on desktop, stacked on mobile). */
declare function AboutPromo({ heading, text, image, imagePosition }: AboutPromoProps): react.JSX.Element;

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

interface ReviewImage {
    src: string;
    alt?: string;
}
interface ReviewsCarouselProps {
    heading?: string;
    images: ReviewImage[];
}
/** Horizontal, scroll-snap photo carousel (CSS-only, no JS). */
declare function ReviewsCarousel({ heading, images }: ReviewsCarouselProps): react.JSX.Element;

/** Props for every editable component, keyed by component name. */
interface Props {
    Hero: HeroProps;
    RichText: RichTextProps;
    StatCounters: StatCountersProps;
    AboutPromo: AboutPromoProps;
    FeatureCards: FeatureCardsProps;
    TermsAccordion: TermsAccordionProps;
    ReviewsCarousel: ReviewsCarouselProps;
}
/** Page-level (root) fields — drive SEO metadata, not visible layout. */
interface RootProps {
    title?: string;
    description?: string;
    ogImage?: string;
}
declare const puckConfig: Config;

export { AboutPromo, type AboutPromoProps, FeatureCards, type FeatureCardsProps, type FeatureItem, Hero, type HeroProps, type Props, type ReviewImage, ReviewsCarousel, type ReviewsCarouselProps, RichText, type RichTextProps, type RootProps, StatCounters, type StatCountersProps, type StatItem, type TermItem, TermsAccordion, type TermsAccordionProps, puckConfig };
