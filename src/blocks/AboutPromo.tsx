import { Section } from '../components/Section';
import { safeImageUrl } from '../sanitize';

export interface AboutPromoProps {
  heading: string;
  text?: string;
  image?: string;
  imagePosition?: 'left' | 'right';
}

/** Image + headline promo block (2-col on desktop, stacked on mobile). */
export function AboutPromo({ heading, text, image, imagePosition = 'right' }: AboutPromoProps) {
  const img = safeImageUrl(image);

  const body = (
    <div className="sb-about__body">
      <h2 className="sb-h2">{heading}</h2>
      {text ? <p className="sb-lead">{text}</p> : null}
    </div>
  );

  if (!img) {
    return <Section>{body}</Section>;
  }

  return (
    <Section className={imagePosition === 'left' ? 'sb-about--reverse' : ''}>
      <div className="sb-about__grid">
        <div className="sb-about__media">
          <img className="sb-about__img" src={img} alt={heading} loading="lazy" />
        </div>
        {body}
      </div>
    </Section>
  );
}
