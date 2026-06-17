import { Section } from '../components/Section';
import { safeImageUrl } from '../sanitize';

export interface FeatureItem {
  icon?: string;
  title: string;
  text?: string;
}

export interface FeatureCardsProps {
  heading?: string;
  items: FeatureItem[];
}

/** Grid of icon + title + text feature cards. */
export function FeatureCards({ heading, items }: FeatureCardsProps) {
  return (
    <Section>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      <div className="sb-features__grid">
        {(items ?? []).map((item, index) => {
          const icon = safeImageUrl(item.icon);
          return (
            <div className="sb-feature" key={index}>
              {icon ? <img className="sb-feature__icon" src={icon} alt="" loading="lazy" /> : null}
              <h3 className="sb-feature__title">{item.title}</h3>
              {item.text ? <p className="sb-feature__text">{item.text}</p> : null}
            </div>
          );
        })}
      </div>
    </Section>
  );
}
