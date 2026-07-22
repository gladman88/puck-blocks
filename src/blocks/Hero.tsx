import type { ReactNode } from 'react';
import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon } from '../components/ContactIcon';

export interface HeroProps {
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

/** Highlight the first occurrence of `accent` inside `heading` (gold span). */
function renderHeading(heading: string, accent?: string): ReactNode {
  const word = accent?.trim();
  if (!word) return heading;
  const idx = heading.toLowerCase().indexOf(word.toLowerCase());
  if (idx === -1) return heading;
  return (
    <>
      {heading.slice(0, idx)}
      <span className="sb-hero__accent">{heading.slice(idx, idx + word.length)}</span>
      {heading.slice(idx + word.length)}
    </>
  );
}

/**
 * Full-bleed hero — content left-aligned over a darkened background image, with
 * an uppercase heading (one word accented) and a CTA row that can carry round
 * WhatsApp/Telegram buttons. Framework-neutral; styled by the shipped CSS.
 */
export function Hero({
  heading,
  accentWord,
  subheading,
  backgroundImage,
  ctaLabel,
  ctaHref,
  whatsapp,
  telegram,
}: HeroProps) {
  const bg = safeImageUrl(backgroundImage);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);

  return (
    <section
      className="sb-hero"
      style={bg ? { backgroundImage: `url("${encodeURI(bg)}")` } : undefined}
    >
      {bg ? <div className="sb-hero__overlay" aria-hidden="true" /> : null}
      <div className="sb-hero__inner">
        <h1 className="sb-h1">{renderHeading(heading, accentWord)}</h1>
        {subheading ? <p className="sb-lead">{subheading}</p> : null}
        {hasCta || wa || tg ? (
          <div className="sb-hero__cta">
            {hasCta ? (
              <a className="sb-btn" href={href}>
                {ctaLabel}
              </a>
            ) : null}
            {wa || tg ? (
              // WhatsApp + Telegram are one wrap unit: on a narrow phone the
              // whole pair drops to the next line together (under the CTA)
              // instead of WhatsApp sticking to the CTA and Telegram falling
              // to a third line alone.
              <div className="sb-hero__socials">
                {wa ? (
                  <a className="sb-hero__social" href={wa} target="_blank" rel="noopener noreferrer" aria-label="WhatsApp">
                    <ContactIcon kind="whatsapp" />
                  </a>
                ) : null}
                {tg ? (
                  <a className="sb-hero__social" href={tg} target="_blank" rel="noopener noreferrer" aria-label="Telegram">
                    <ContactIcon kind="telegram" />
                  </a>
                ) : null}
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
