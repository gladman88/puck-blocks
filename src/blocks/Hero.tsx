import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { safeHref, safeImageUrl } from '../sanitize';
import { ContactIcon } from '../components/ContactIcon';

export interface HeroProps {
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
  /** Optional round social buttons shown next to the CTA. */
  whatsapp?: string;
  telegram?: string;
}

/** Phone held upright; tablet, desktop and landscape phones keep the image. */
const HERO_VIDEO_MEDIA = '(max-width: 767px) and (orientation: portrait)';

type MQL = MediaQueryList & {
  addListener?: (cb: () => void) => void;
  removeListener?: (cb: () => void) => void;
};

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
  mobileVideoHevc,
  mobileVideo,
  mobileVideoPoster,
  ctaLabel,
  ctaHref,
  whatsapp,
  telegram,
}: HeroProps) {
  const bg = safeImageUrl(backgroundImage);
  const hevc = safeImageUrl(mobileVideoHevc);
  const h264 = safeImageUrl(mobileVideo);
  const poster = safeImageUrl(mobileVideoPoster);
  const hasVideo = Boolean(hevc || h264);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || typeof window === 'undefined' || typeof window.matchMedia !== 'function') return;
    const mq = window.matchMedia(HERO_VIDEO_MEDIA) as MQL;
    const rm = window.matchMedia('(prefers-reduced-motion: reduce)') as MQL;

    const allowed = () => {
      if (!mq.matches) return false;
      if (rm.matches) return false;
      const conn = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
      return !conn?.saveData;
    };
    const addSources = () => {
      if (video.querySelector('source')) return;
      const add = (src: string | undefined, type: string) => {
        if (!src) return;
        const el = document.createElement('source');
        el.src = src;
        el.type = type;
        video.appendChild(el);
      };
      add(hevc, 'video/mp4; codecs="hvc1"');
      add(h264, 'video/mp4');
      video.load();
    };
    const start = () => {
      if (!allowed()) return;
      addSources();
      const p = video.play();
      if (p && typeof p.catch === 'function') p.catch(() => {});
    };
    const onChange = () => {
      if (mq.matches) start();
      else video.pause();
    };
    const onReducedChange = () => {
      if (rm.matches) video.pause();
      else onChange();
    };
    const onPlaying = () => setPlaying(true);
    const onError = () => setPlaying(false);

    video.addEventListener('playing', onPlaying);
    video.addEventListener('error', onError, true);
    if (typeof mq.addEventListener === 'function') mq.addEventListener('change', onChange);
    else mq.addListener?.(onChange);
    if (typeof rm.addEventListener === 'function') rm.addEventListener('change', onReducedChange);
    else rm.addListener?.(onReducedChange);
    start();

    return () => {
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('error', onError, true);
      if (typeof mq.removeEventListener === 'function') mq.removeEventListener('change', onChange);
      else mq.removeListener?.(onChange);
      if (typeof rm.removeEventListener === 'function') rm.removeEventListener('change', onReducedChange);
      else rm.removeListener?.(onReducedChange);
      video.pause();
      video.querySelectorAll('source').forEach((el) => el.remove());
      video.removeAttribute('src');
      video.load();
      setPlaying(false);
    };
  }, [hevc, h264]);
  const href = safeHref(ctaHref);
  const hasCta = Boolean(ctaLabel && href);
  const wa = safeHref(whatsapp);
  const tg = safeHref(telegram);

  const hasPoster = hasVideo && Boolean(poster);
  const style: CSSProperties = {};
  if (bg) style.backgroundImage = `url("${encodeURI(bg)}")`;
  if (hasPoster && poster) (style as Record<string, string>)['--sb-hero-poster'] = `url("${encodeURI(poster)}")`;

  return (
    <section className={['sb-hero', hasVideo ? 'sb-hero--has-video' : '', hasPoster ? 'sb-hero--has-poster' : ''].filter(Boolean).join(' ')}
      style={bg || hasPoster ? style : undefined}>
      {hasVideo ? (
        // No src/<source> in server markup: the client adds them only on a phone,
        // so desktop never downloads the file.
        <video
          ref={videoRef}
          className={playing ? 'sb-hero__video sb-hero__video--playing' : 'sb-hero__video'}
          muted
          playsInline
          loop
          autoPlay
          preload="none"
          poster={poster ? encodeURI(poster) : undefined}
          aria-hidden="true"
          tabIndex={-1}
        />
      ) : null}
      {bg || hasVideo ? <div className="sb-hero__overlay" aria-hidden="true" /> : null}
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
