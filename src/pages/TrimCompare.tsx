import { formatCardDate } from '../blocks/catalog/VehicleCard';
import { formatBahtCeil } from '../blocks/catalog/price';
import { PageIcon } from './icons';
import { trimLabel, type ModelVersion } from './model';
import { MODEL_HERO_ID } from './ModelHero';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';

function seatsValue(v: ModelVersion): string | null {
  const s = v.unit.seats;
  return s === null || s === undefined || s === '' ? null : String(s);
}

/**
 * «Комплектации»: a card per trim — photo, seats, per-day range, 30 days,
 * when it is free — and «Выбрать», which switches the hero to that trim and
 * scrolls back to it. Renders nothing when the model has one trim.
 */
export function TrimCompare({ eyebrow }: { eyebrow?: string }) {
  const page = useModelPage();
  if (!page || page.versions.length < 2) return null;
  const { model, locale, versions, selected, select } = page;
  const t = PAGE_STRINGS[locale];
  const kicker = eyebrow ?? model.label;

  const choose = (key: string) => {
    select(key);
    if (typeof document !== 'undefined') {
      document.getElementById(MODEL_HERO_ID)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section className="sb-section sb-mp-sec">
      <div className="sb-container">
        {kicker ? <p className="sb-mp-eyebrow">{kicker}</p> : null}
        <h2 className="sb-h2">{t.trims}</h2>
        <div className="sb-mp-cmps" style={{ ['--n' as string]: Math.min(versions.length, 3) }}>
          {versions.map((v) => {
            const name = trimLabel(v.trim, t.baseTrim);
            const cp = v.unit.card_prices;
            const range = cp
              ? `${formatBahtCeil(cp.per_day_min)}${cp.per_day_min === cp.per_day_max ? '' : ` – ${formatBahtCeil(cp.per_day_max)}`} ฿`
              : null;
            const month = cp?.quotes.find((q) => q.days === 30);
            const free =
              v.availableCount > 0
                ? t.freeNow
                : v.unit.free_from
                  ? t.freeFrom(formatCardDate(v.unit.free_from, locale))
                  : t.busy;
            const seats = seatsValue(v);
            const on = selected?.key === v.key;
            return (
              <article key={v.key} className={`sb-mp-cmp${on ? ' is-on' : ''}`}>
                <div className="sb-mp-cmp__ph">
                  {v.unit.photo_url ? <img src={v.unit.photo_url} alt={`${model.label} ${name}`} loading="lazy" /> : null}
                </div>
                <div className="sb-mp-cmp__b">
                  <h3>{name}</h3>
                  <ul>
                    {seats ? (
                      <li>
                        <span>
                          <PageIcon name="users" />
                          {t.seatsRow}
                        </span>
                        <b>{seats}</b>
                      </li>
                    ) : null}
                    {range ? (
                      <li>
                        <span>
                          <PageIcon name="calendar" />
                          {t.perDayRow}
                        </span>
                        <b>{range}</b>
                      </li>
                    ) : null}
                    {month ? (
                      <li>
                        <span>
                          <PageIcon name="timer" />
                          {t.monthRow}
                        </span>
                        <b>{`${formatBahtCeil(month.total)} ฿`}</b>
                      </li>
                    ) : null}
                    <li>
                      <span>
                        <PageIcon name="check" />
                        {t.freeRow}
                      </span>
                      <b>{free}</b>
                    </li>
                  </ul>
                  <button type="button" className="sb-mp-btn-ghost" aria-pressed={on} onClick={() => choose(v.key)}>
                    {on ? t.chosen : t.choose}
                  </button>
                </div>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}
