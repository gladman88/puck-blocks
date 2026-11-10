import { buildSpecRows, type SpecRow, type VehicleSpecs } from '../blocks/catalog/specs';
import { IconBadge, type PageIconName } from './icons';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';

export interface ModelOverviewProps {
  /** «О модели» — plain text, paragraphs split by a blank line. */
  about: string;
  /** Specs of the four key figures; default — the chosen trim of `ModelPageProvider`. */
  specs?: VehicleSpecs;
  /** Small line above the heading; default — the model name. */
  eyebrow?: string;
  locale?: 'ru' | 'en';
}

interface Fact {
  key: string;
  icon: PageIconName;
  number: string;
  unit: string;
  caption: string;
}

/** «686 км» → «686» + «км» (the value and unit come from `buildSpecRows`). */
function splitValue(row: SpecRow): { number: string; unit: string } {
  const i = row.value.indexOf(' ');
  return i < 0 ? { number: row.value, unit: '' } : { number: row.value.slice(0, i), unit: row.value.slice(i + 1) };
}

/** Range (or consumption) | power | 0–100 | seats — the missing ones are skipped. */
function keyFacts(specs: VehicleSpecs, locale: 'ru' | 'en'): Fact[] {
  const t = PAGE_STRINGS[locale];
  const rows = buildSpecRows(specs, locale);
  const row = (key: string) => rows.find((r) => r.key === key);
  const electric = specs.fuel_type === 'electric';
  const picks: [SpecRow | undefined, PageIconName, string][] = [
    row('range')
      ? [row('range'), 'route', electric ? t.factRangeEv : t.factRange]
      : [row('fuel_consumption') ?? row('power_consumption'), 'fuel', t.factConsumption],
    [row('power'), 'gauge', t.factPower],
    [row('sprint'), 'timer', t.factSprint],
    [row('seats'), 'users', t.factSeats],
  ];
  return picks
    .filter((p): p is [SpecRow, PageIconName, string] => Boolean(p[0]))
    .map(([r, icon, caption]) => ({ key: r.key, icon, caption, ...splitValue(r) }));
}

/**
 * «О модели»: the four key figures in one 2×2 card + the model text. On
 * ≤1024px the text goes above the figures (styles.css).
 */
export function ModelOverview({ about, specs, eyebrow, locale: localeProp }: ModelOverviewProps) {
  const page = useModelPage();
  const locale = localeProp ?? page?.locale ?? 'ru';
  const t = PAGE_STRINGS[locale];
  const source = specs ?? page?.selected?.unit;
  const facts = source ? keyFacts(source, locale) : [];
  const paragraphs = about
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  if (facts.length === 0 && paragraphs.length === 0) return null;
  const kicker = eyebrow ?? page?.model.label;

  return (
    <section className="sb-section sb-mp-sec">
      <div className="sb-container sb-mp-about">
        {facts.length > 0 ? (
          <ul className="sb-mp-facts" aria-label={t.keyFacts}>
            {facts.map((f) => (
              <li key={f.key} className="sb-mp-fact">
                <IconBadge name={f.icon} />
                <div>
                  <b>
                    {f.number}
                    {f.unit ? <small>{f.unit}</small> : null}
                  </b>
                  <span>{f.caption}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {paragraphs.length > 0 ? (
          <div className="sb-mp-about__text">
            {kicker ? <p className="sb-mp-eyebrow">{kicker}</p> : null}
            <h2 className="sb-h2">{t.about}</h2>
            {paragraphs.map((p, i) => (
              <p key={i} className="sb-mp-text">
                {p}
              </p>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  );
}
