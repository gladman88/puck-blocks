import { Section } from '../components/Section';
import { VideoEmbed } from '../components/VideoEmbed';
import { safeImageUrl } from '../sanitize';

export interface AboutPromoProps {
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
export function AboutPromo({
  heading,
  text,
  image,
  videoUrl,
  imagePosition = 'right',
}: AboutPromoProps) {
  const img = safeImageUrl(image);
  const hasVideo = Boolean(videoUrl && videoUrl.trim());

  const body = (
    <div className="sb-about__body">
      <h2 className="sb-h2">{heading}</h2>
      {text ? <p className="sb-lead">{text}</p> : null}
    </div>
  );

  if (!img && !hasVideo) {
    return <Section>{body}</Section>;
  }

  return (
    <Section className={imagePosition === 'left' ? 'sb-about--reverse' : ''}>
      <div className="sb-about__grid">
        <div className="sb-about__media">
          {hasVideo ? <VideoEmbed url={videoUrl as string} title={heading} /> : null}
          {img ? <img className="sb-about__img" src={img} alt={heading} loading="lazy" /> : null}
        </div>
        {body}
      </div>
    </Section>
  );
}
