import { Config } from '@measured/puck';
import * as react from 'react';

interface HeroProps {
    heading: string;
    subheading?: string;
    /** Optional background image URL. Plain <img>/CSS only — no framework-specific image component. */
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
/**
 * The single Puck config shared by the editor (in FMS) and the renderer
 * (in frontend_site). Keeping it here guarantees the editor preview and the
 * live page render identically.
 */
declare const puckConfig: Config<Props, RootProps>;

export { Hero, type HeroProps, type Props, RichText, type RichTextProps, type RootProps, puckConfig };
