import { Section } from '../components/Section';
import { VideoEmbed } from '../components/VideoEmbed';
import { safeImageUrl } from '../sanitize';

export interface ReviewItem {
  /** Reviewer name. */
  name?: string;
  /** 1–5 stars. */
  rating?: number;
  /** Review text. */
  text?: string;
  /** Reviewer avatar image URL. */
  avatar?: string;
  /** Review photo / screenshot image URL (shown when there is no video). */
  photo?: string;
  /** Video review link (YouTube preferred — embeds inline). */
  videoUrl?: string;
}

export interface ReviewsCarouselProps {
  heading?: string;
  /** Section anchor id so the header nav can scroll here (e.g. "reviews"). */
  anchorId?: string;
  reviews?: ReviewItem[];
}

interface SafeReview {
  name?: string;
  rating?: number;
  text?: string;
  avatar?: string;
  photo?: string;
  videoUrl?: string;
}

function Stars({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="sb-review__stars" aria-label={`${full} из 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="sb-review__stars-empty">{'★★★★★'.slice(0, 5 - full)}</span>
    </span>
  );
}

/** One review. Text, video (inline YouTube on click), photo — any combination. */
function ReviewCard({ review }: { review: SafeReview }) {
  const hasHead = Boolean(review.name || review.avatar || review.rating);

  return (
    <article className="sb-review">
      {review.videoUrl ? (
        <VideoEmbed
          url={review.videoUrl}
          title={review.name ? `Видео-отзыв — ${review.name}` : 'Видео-отзыв'}
        />
      ) : review.photo ? (
        <div className="sb-review__media">
          <img
            className="sb-review__photo"
            src={review.photo}
            alt={review.name ?? ''}
            loading="lazy"
          />
        </div>
      ) : null}

      <div className="sb-review__body">
        {hasHead ? (
          <div className="sb-review__head">
            {review.avatar ? (
              <img className="sb-review__avatar" src={review.avatar} alt="" loading="lazy" />
            ) : null}
            <div className="sb-review__meta">
              {review.name ? <p className="sb-review__name">{review.name}</p> : null}
              {review.rating ? <Stars rating={review.rating} /> : null}
            </div>
          </div>
        ) : null}
        {review.text ? <p className="sb-review__text">{review.text}</p> : null}
      </div>
    </article>
  );
}

/**
 * Reviews as a responsive grid of cards. Each card is one cohesive review —
 * name + rating + text and, optionally, an inline video (YouTube) or photo —
 * instead of disconnected "text reviews" and "video reviews" sections.
 */
export function ReviewsCarousel({ heading, anchorId, reviews }: ReviewsCarouselProps) {
  const safe: SafeReview[] = (reviews ?? [])
    .map((r) => ({
      name: r.name?.trim() || undefined,
      rating: typeof r.rating === 'number' && r.rating > 0 ? r.rating : undefined,
      text: r.text?.trim() || undefined,
      avatar: safeImageUrl(r.avatar ?? '') || undefined,
      photo: safeImageUrl(r.photo ?? '') || undefined,
      videoUrl: r.videoUrl?.trim() || undefined,
    }))
    .filter((r) => r.name || r.text || r.photo || r.videoUrl);

  return (
    <Section id={anchorId || 'reviews'}>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      {safe.length > 0 ? (
        <div className="sb-reviews-grid">
          {safe.map((r, i) => (
            <ReviewCard key={i} review={r} />
          ))}
        </div>
      ) : null}
    </Section>
  );
}
