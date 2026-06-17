import { safeHref, safeImageUrl } from '../sanitize';

export interface HeroProps {
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
export function Hero({ heading, subheading, backgroundImage, ctaLabel, ctaHref }: HeroProps) {
  const bg = safeImageUrl(backgroundImage);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  return (
    <section
      className="sb-hero"
      style={bg ? { backgroundImage: `url("${encodeURI(bg)}")` } : undefined}
    >
      {bg ? <div className="sb-hero__overlay" aria-hidden="true" /> : null}
      <div className="sb-hero__inner">
        <h1 className="sb-h1">{heading}</h1>
        {subheading ? <p className="sb-lead">{subheading}</p> : null}
        {hasCta ? (
          <div className="sb-hero__cta">
            <a className="sb-btn" href={href}>
              {ctaLabel}
            </a>
          </div>
        ) : null}
      </div>
    </section>
  );
}
