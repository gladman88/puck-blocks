import { Section } from '../components/Section';

export interface StatItem {
  value: string;
  text?: string;
}

export interface StatCountersProps {
  heading?: string;
  items: StatItem[];
}

/** Row of stat/advantage cards (big accent number + description). */
export function StatCounters({ heading, items }: StatCountersProps) {
  return (
    <Section>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}
      <div className="sb-stats__grid">
        {(items ?? []).map((item, index) => (
          <div className="sb-stat" key={index}>
            <div className="sb-stat__value">{item.value}</div>
            {item.text ? <p className="sb-stat__text">{item.text}</p> : null}
          </div>
        ))}
      </div>
    </Section>
  );
}
