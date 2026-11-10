import { categoryLabel } from '../blocks/VehicleCatalog';
import { Breadcrumbs } from './Breadcrumbs';
import { PageIcon } from './icons';
import { cheapestModel } from './model';
import { PAGE_STRINGS } from './strings';
import type { CatalogCategoryPage, CatalogModelPage, Crumb } from './types';

export interface CategoryHeaderProps {
  locale: 'ru' | 'en';
  /** Section of the page — its categories only. */
  section: 'cars' | 'bikes';
  h1: string;
  crumbs?: Crumb[];
  /** Models of THIS page (the whole type on a type page). */
  models: CatalogModelPage[];
  /** Models of the section, for the category counters; default — `models`. */
  sectionModels?: CatalogModelPage[];
  /** `GET /catalog/categories/` — only the published ones of `section` are linked. */
  categories: CatalogCategoryPage[];
  /** Slug of the current category (its chip is highlighted); none — type page. */
  currentSlug?: string;
}

/**
 * Top of a category / type page: breadcrumbs, h1 (wraps balanced, never cut), the
 * figures line (models · from N ฿/day for M+ days · free today) and a row of
 * links to the PUBLISHED categories of the section with model counters.
 */
export function CategoryHeader({
  locale,
  section,
  h1,
  crumbs = [],
  models,
  sectionModels,
  categories,
  currentSlug,
}: CategoryHeaderProps) {
  const t = PAGE_STRINGS[locale];
  const from = cheapestModel(models);
  const freeToday = models.filter((m) => m.available_today_count > 0).length;
  const pool = sectionModels ?? models;
  const chips = categories
    .filter((c) => c.is_published && c.section === section && c.slug)
    .map((c) => ({ c, count: pool.filter((m) => m.category?.id === c.id).length }))
    .filter((x) => x.count > 0);

  return (
    <header className="sb-section sb-mc-head">
      <div className="sb-container">
        <Breadcrumbs crumbs={crumbs} locale={locale} />
        <h1 className="sb-mc-h1">{h1}</h1>
        <ul className="sb-mc-stats">
          <li>
            <PageIcon name="car" />
            {t.modelsCount(models.length)}
          </li>
          {from ? (
            <li>
              <PageIcon name="calendar" />
              <span>
                {`${t.from} `}
                <b>{`${from.price} ฿`}</b>
                {` ${t.statsPrice(from.minDays)}`}
              </span>
            </li>
          ) : null}
          {freeToday > 0 ? (
            <li>
              <PageIcon name="check" />
              {t.statsFree(freeToday)}
            </li>
          ) : null}
        </ul>
        {chips.length > 0 ? (
          <nav className="sb-mc-chips" aria-label={t.categories}>
            {chips.map(({ c, count }) => {
              const on = c.slug === currentSlug;
              return (
                <a
                  key={c.id}
                  className={`sb-mc-chip${on ? ' is-on' : ''}`}
                  href={`/${locale}/${section}/${c.slug}`}
                  aria-current={on ? 'page' : undefined}
                >
                  {categoryLabel(c, locale)}
                  <i>{count}</i>
                </a>
              );
            })}
          </nav>
        ) : null}
      </div>
    </header>
  );
}
