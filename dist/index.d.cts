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

/** Props for every editable component, keyed by component name. */
interface Props {
    Hero: HeroProps;
    RichText: RichTextProps;
}
/** Page-level (root) fields — drive SEO metadata, not visible layout. */
interface RootProps {
    title?: string;
    description?: string;
    ogImage?: string;
}
declare const puckConfig: Config;

export { Hero, type HeroProps, type Props, RichText, type RichTextProps, type RootProps, puckConfig };
