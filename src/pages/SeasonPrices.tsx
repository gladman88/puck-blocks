import { PriceGrid } from '../blocks/catalog/PriceGrid';
import { useModelPage } from './ModelPageContext';
import { PAGE_STRINGS } from './strings';
import { TrimSwitcher } from './TrimSwitcher';

/**
 * «Цены по сезонам» of a model page: the trim switcher (shared with the hero)
 * and the season × period table of the chosen trim (`PriceGrid`, server
 * prices), both in one card whose side padding is the table's bleed. Nothing
 * when the chosen trim has no seasons. Needs `ModelPageProvider`.
 */
export function SeasonPrices({ eyebrow }: { eyebrow?: string }) {
  const page = useModelPage();
  if (!page || !page.selected) return null;
  const { model, locale, today, selected } = page;
  const periods = selected.unit.pricing_periods ?? [];
  const seasons = selected.unit.pricing_seasons ?? [];
  if (periods.length === 0 || seasons.length === 0) return null;
  const t = PAGE_STRINGS[locale];
  const kicker = eyebrow ?? model.label;

  return (
    <section className="sb-section sb-mp-sec">
      <div className="sb-container">
        {kicker ? <p className="sb-mp-eyebrow">{kicker}</p> : null}
        <h2 className="sb-h2">{t.seasonPrices}</h2>
        <div className="sb-mp-pg">
          <TrimSwitcher inline />
          <PriceGrid periods={periods} seasons={seasons} referenceDate={today} locale={locale} showLabel={false} />
        </div>
      </div>
    </section>
  );
}
