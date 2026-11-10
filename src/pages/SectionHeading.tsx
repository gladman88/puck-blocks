import { categoryLabel } from '../blocks/VehicleCatalog';
import { PageIcon } from './icons';
import { cheapestModel } from './model';
import { PAGE_STRINGS } from './strings';
import type { CatalogCategoryPage, CatalogModelPage } from './types';

/** «Все …» shows when a group has more models than this (the type page shows
 *  the first few of a category). */
const MORE_AFTER = 3;

export interface SectionHeadingProps {
  locale: 'ru' | 'en';
  section: 'cars' | 'bikes';
  category: CatalogCategoryPage;
  /** Models of the category (all of them — the counter and the «from» price). */
  models: CatalogModelPage[];
  /** id of the h2 (the host's group `aria-labelledby`). */
  id?: string;
}

/**
 * Head of a category group on a type page: the category name, «N моделей · от
 * X ฿» and, with more than three models and a published category page, the
 * «Все {категория} · N →» link to it.
 */
export function SectionHeading({ locale, section, category, models, id }: SectionHeadingProps) {
  const t = PAGE_STRINGS[locale];
  const label = categoryLabel(category, locale);
  const from = cheapestModel(models);
  const more = models.length > MORE_AFTER && category.is_published && Boolean(category.slug);

  return (
    <div className="sb-mc-group__head">
      <h2 className="sb-mc-h2" id={id}>
        {label}
        <span>{t.groupStats(models.length, from?.price ?? null)}</span>
      </h2>
      {more ? (
        <a className="sb-mc-more" href={`/${locale}/${section}/${category.slug}`}>
          {t.allOf(label, models.length)}
          <PageIcon name="arrowRight" />
        </a>
      ) : null}
    </div>
  );
}
