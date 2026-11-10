import { buildSpecRows, type VehicleSpecs } from '../blocks/catalog/specs';
import { IconBadge, PageIcon, type PageIconName } from './icons';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';

export interface SpecGroupsProps {
  /** Default — the chosen trim of `ModelPageProvider`. */
  specs?: VehicleSpecs;
  /** Small line above the heading; default — the model name. */
  eyebrow?: string;
  locale?: 'ru' | 'en';
}

type GroupId = 'engine' | 'dynamics' | 'body';

/** Which column a `buildSpecRows` row goes to (rows keep its order). */
const GROUP_OF: Record<string, GroupId> = {
  engine: 'engine',
  battery: 'engine',
  fuel: 'engine',
  range: 'engine',
  tank: 'engine',
  fuel_consumption: 'engine',
  power_consumption: 'engine',
  power: 'dynamics',
  transmission: 'dynamics',
  drive: 'dynamics',
  sprint: 'dynamics',
  max_speed: 'dynamics',
  body: 'body',
  seats: 'body',
  clearance: 'body',
  weight: 'body',
};

const ROW_ICON: Record<string, PageIconName> = {
  engine: 'engine',
  battery: 'battery',
  fuel: 'fuel',
  range: 'route',
  tank: 'fuel',
  fuel_consumption: 'fuel',
  power_consumption: 'bolt',
  power: 'gauge',
  transmission: 'gearbox',
  drive: 'drive',
  sprint: 'timer',
  max_speed: 'speed',
  body: 'car',
  seats: 'users',
  clearance: 'height',
  weight: 'weight',
};

const GROUP_ICON: Record<GroupId, PageIconName> = { engine: 'engine', dynamics: 'timer', body: 'car' };

/**
 * «Характеристики»: three columns — engine and range / performance / body and
 * interior — over `buildSpecRows` (values and units only from there). Columns
 * share one height; an empty row or column is not drawn.
 */
export function SpecGroups({ specs, eyebrow, locale: localeProp }: SpecGroupsProps) {
  const page = useModelPage();
  const locale = localeProp ?? page?.locale ?? 'ru';
  const t = PAGE_STRINGS[locale];
  const source = specs ?? page?.selected?.unit;
  if (!source) return null;
  const rows = buildSpecRows(source, locale);
  const titles: Record<GroupId, string> = {
    engine: t.groupEngine,
    dynamics: t.groupDynamics,
    body: t.groupBody,
  };
  const groups = (['engine', 'dynamics', 'body'] as const)
    .map((id) => ({ id, rows: rows.filter((r) => GROUP_OF[r.key] === id) }))
    .filter((g) => g.rows.length > 0);
  if (groups.length === 0) return null;
  const kicker = eyebrow ?? page?.model.label;

  return (
    <section className="sb-section sb-mp-sec sb-mp-sec--alt">
      <div className="sb-container">
        {kicker ? <p className="sb-mp-eyebrow">{kicker}</p> : null}
        <h2 className="sb-h2">{t.specs}</h2>
        <div className="sb-mp-specs">
          {groups.map((g) => (
            <div key={g.id} className="sb-mp-sgroup">
              <h3>
                <IconBadge name={GROUP_ICON[g.id]} />
                {titles[g.id]}
              </h3>
              <ul>
                {g.rows.map((r) => (
                  <li key={r.key}>
                    <span>
                      <PageIcon name={ROW_ICON[r.key] ?? 'check'} />
                      {r.label}
                    </span>
                    <b>{r.value}</b>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
