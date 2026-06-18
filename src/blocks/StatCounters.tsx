import { Section } from '../components/Section';

export interface StatItem {
  value: string;
  text?: string;
}

export interface StatCountersProps {
  heading?: string;
  items: StatItem[];
}

/** Scalloped "verified" seal. The check is a cut-out, so it shows the card
 *  colour through it (gold check on the dark seal, dark check on the white). */
function CheckBadge() {
  return (
    <svg className="sb-stat__badge" viewBox="0 0 24 24" width="46" height="46" aria-hidden focusable="false">
      <path
        fill="currentColor"
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.603 3.799A4.49 4.49 0 0 1 12 2.25c1.357 0 2.573.6 3.397 1.549a4.49 4.49 0 0 1 3.498 1.307 4.491 4.491 0 0 1 1.307 3.497A4.49 4.49 0 0 1 21.75 12a4.49 4.49 0 0 1-1.549 3.397 4.491 4.491 0 0 1-1.307 3.497 4.491 4.491 0 0 1-3.497 1.307A4.49 4.49 0 0 1 12 21.75a4.49 4.49 0 0 1-3.397-1.549 4.49 4.49 0 0 1-3.498-1.306 4.491 4.491 0 0 1-1.307-3.498A4.49 4.49 0 0 1 2.25 12c0-1.357.6-2.573 1.549-3.397a4.49 4.49 0 0 1 1.307-3.497 4.49 4.49 0 0 1 3.497-1.307Zm7.007 6.387a.75.75 0 1 0-1.22-.872l-3.236 4.53L9.53 12.22a.75.75 0 0 0-1.06 1.06l2.25 2.25a.75.75 0 0 0 1.14-.094l3.75-5.25Z"
      />
    </svg>
  );
}

/**
 * Advantage cards: a check-badge, a bold title, a description. Cards alternate
 * gold/dark and step up-and-down (zigzag), matching the marketing site.
 */
export function StatCounters({ heading, items }: StatCountersProps) {
  return (
    <Section>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      <div className="sb-stats">
        {(items ?? []).map((item, index) => (
          <div
            className={`sb-stat ${index % 2 === 0 ? 'sb-stat--gold' : 'sb-stat--dark'}`}
            key={index}
          >
            <CheckBadge />
            <div className="sb-stat__value">{item.value}</div>
            {item.text ? <p className="sb-stat__text">{item.text}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
