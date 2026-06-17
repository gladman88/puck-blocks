import { Section } from '../components/Section';
import { safeImageUrl } from '../sanitize';

export interface ReviewImage {
  src: string;
  alt?: string;
}

export interface ReviewsCarouselProps {
  heading?: string;
  images: ReviewImage[];
}

/** Horizontal, scroll-snap photo carousel (CSS-only, no JS). */
export function ReviewsCarousel({ heading, images }: ReviewsCarouselProps) {
  const safe = (images ?? [])
    .map((image) => ({ src: safeImageUrl(image.src), alt: image.alt }))
    .filter((image): image is { src: string; alt: string | undefined } => Boolean(image.src));

  return (
    <Section>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      <div className="sb-reviews__track">
        {safe.map((image, index) => (
          <div className="sb-reviews__item" key={index}>
            <img className="sb-reviews__img" src={image.src} alt={image.alt ?? ''} loading="lazy" />
          </div>
        ))}
      </div>
    </Section>
  );
}
