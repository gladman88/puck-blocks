import { Config } from '@puckeditor/core';
import * as react from 'react';

interface HeroProps {
    heading: string;
    subheading?: string;
    /** Optional background image URL. Plain CSS only — no framework image component. */
    backgroundImage?: string;
    ctaLabel?: string;
    ctaHref?: string;
}
/**
 * Hero section. Framework-neutral: renders plain HTML elements so it works
 * server-side in Next.js and client-side in Vite without any next/* imports.
 */
declare function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }: HeroProps): react.JSX.Element;

interface RichTextProps {
    /** Plain text. Blank lines separate paragraphs; single newlines are preserved. */
    content: string;
}
/**
 * Simple text block. Framework-neutral plain HTML. Rich formatting (markdown)
 * can be layered later without changing the data contract.
 */
declare function RichText({ content }: RichTextProps): react.JSX.Element;

/** Props for every editable component, keyed by component name. */
interface Props {
    Hero: HeroProps;
    RichText: RichTextProps;
}
/** Page-level (root) fields — these drive SEO metadata, not visible layout. */
interface RootProps {
    title?: string;
    description?: string;
    ogImage?: string;
}
declare const puckConfig: Config;

export { Hero, type HeroProps, type Props, RichText, type RichTextProps, type RootProps, puckConfig };
