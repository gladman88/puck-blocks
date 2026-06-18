import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Section } from '../components/Section';
import { Carousel } from '../components/Carousel';
import { VideoEmbed } from '../components/VideoEmbed';
import { safeImageUrl } from '../sanitize';

export interface TextReview {
  name?: string;
  rating?: number;
  text?: string;
  avatar?: string;
  /** Full-review screenshot opened by «Читать полностью». */
  screenshot?: string;
}

export interface MediaReview {
  /** Video link (YouTube preferred — plays inline). */
  videoUrl?: string;
  /** Photo / screenshot (used when there is no video). */
  photo?: string;
  caption?: string;
}

export interface ReviewsCarouselProps {
  heading?: string;
  /** Section anchor id so the header nav can scroll here (e.g. "reviews"). */
  anchorId?: string;
  textReviews?: TextReview[];
  mediaReviews?: MediaReview[];
}

function Stars({ rating }: { rating: number }) {
  const full = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span className="sb-rcard__stars" aria-label={`${full} из 5`}>
      {'★★★★★'.slice(0, full)}
      <span className="sb-rcard__stars-empty">{'★★★★★'.slice(0, 5 - full)}</span>
    </span>
  );
}

function TextCard({ review }: { review: TextReview }) {
  const [open, setOpen] = useState(false);
  const name = review.name?.trim();
  const avatar = safeImageUrl(review.avatar ?? '');
  const screenshot = safeImageUrl(review.screenshot ?? '');
  const initial = (name || '?').trim().charAt(0).toUpperCase();
  return (
    <article className="sb-rcard">
      <div className="sb-rcard__head">
        {avatar ? (
          <img className="sb-rcard__avatar" src={avatar} alt="" loading="lazy" />
        ) : (
          <span className="sb-rcard__avatar sb-rcard__avatar--initial" aria-hidden>
            {initial}
          </span>
        )}
        <div className="sb-rcard__meta">
          {name ? <p className="sb-rcard__name">{name}</p> : null}
          {review.rating ? <Stars rating={review.rating} /> : null}
        </div>
      </div>
      {review.text ? <p className="sb-rcard__text">{review.text}</p> : null}
      {screenshot ? (
        <>
          <button type="button" className="sb-rcard__more" onClick={() => setOpen(true)}>
            Читать полностью
          </button>
          {open && typeof document !== 'undefined'
            ? createPortal(
                <div
                  className="sb-lightbox"
                  role="dialog"
                  aria-modal="true"
                  onClick={() => setOpen(false)}
                >
                  <button type="button" className="sb-lightbox__close" aria-label="Закрыть">
                    ×
                  </button>
                  <img
                    className="sb-lightbox__img"
                    src={screenshot}
                    alt={name ? `Отзыв — ${name}` : 'Отзыв'}
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>,
                document.body,
              )
            : null}
        </>
      ) : null}
    </article>
  );
}

function MediaCard({ item }: { item: MediaReview }) {
  const photo = safeImageUrl(item.photo ?? '');
  return (
    <figure className="sb-rmedia">
      {item.videoUrl ? (
        <VideoEmbed url={item.videoUrl} title={item.caption || 'Видео-отзыв'} />
      ) : photo ? (
        <img className="sb-rmedia__photo" src={photo} alt={item.caption ?? ''} loading="lazy" />
      ) : null}
      {item.caption ? <figcaption className="sb-rmedia__caption">{item.caption}</figcaption> : null}
    </figure>
  );
}

/**
 * Reviews section with TWO independent carousels: text testimonials (cards with
 * avatar + stars + text) and media reviews (portrait video / photo). Mirrors
 * the original site, where the two are separate rows.
 */
export function ReviewsCarousel({ heading, anchorId, textReviews, mediaReviews }: ReviewsCarouselProps) {
  const texts = (textReviews ?? []).filter((r) => r.name || r.text);
  const media = (mediaReviews ?? []).filter((m) => m.videoUrl || m.photo);

  return (
    <Section id={anchorId || 'reviews'}>
      {texts.length > 0 ? (
        <Carousel title={heading ? <h2 className="sb-h2 sb-h2--inline">{heading}</h2> : null}>
          {texts.map((r, i) => (
            <div className="sb-carousel__cell sb-carousel__cell--text" key={i}>
              <TextCard review={r} />
            </div>
          ))}
        </Carousel>
      ) : heading ? (
        <h2 className="sb-h2">{heading}</h2>
      ) : null}

      {media.length > 0 ? (
        <Carousel>
          {media.map((m, i) => (
            <div className="sb-carousel__cell sb-carousel__cell--media" key={i}>
              <MediaCard item={m} />
            </div>
          ))}
        </Carousel>
      ) : null}
    </Section>
  );
}
