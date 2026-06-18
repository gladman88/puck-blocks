import type { ReactNode } from 'react';
import { Section } from '../components/Section';
import { VideoEmbed } from '../components/VideoEmbed';
import { safeImageUrl } from '../sanitize';

export interface FeatureItem {
  icon?: string;
  title: string;
  text?: string;
}

export interface FeatureCardsProps {
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
export function FeatureCards({ heading, items, videoUrl, videoIndex }: FeatureCardsProps) {
  const list = items ?? [];
  const hasVideo = Boolean(videoUrl && videoUrl.trim());
  const vIdx = typeof videoIndex === 'number' && videoIndex >= 0 ? videoIndex : list.length;

  const cells: ReactNode[] = [];
  const pushVideo = () =>
    cells.push(
      <div className="sb-feature sb-feature--video" key="video">
        <VideoEmbed url={videoUrl as string} title={heading} />
      </div>,
    );

  list.forEach((item, i) => {
    if (hasVideo && i === vIdx) pushVideo();
    const icon = safeImageUrl(item.icon);
    cells.push(
      <div className="sb-feature" key={i}>
        {icon ? <img className="sb-feature__icon" src={icon} alt="" loading="lazy" /> : null}
        <h3 className="sb-feature__title">{item.title}</h3>
        {item.text ? <p className="sb-feature__text">{item.text}</p> : null}
      </div>,
    );
  });
  if (hasVideo && vIdx >= list.length) pushVideo();

  return (
    <Section>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      <div className="sb-features__grid">{cells}</div>
    </Section>
  );
}
