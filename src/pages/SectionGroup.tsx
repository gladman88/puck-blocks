import type { ReactNode } from 'react';
import { SectionHeading } from './SectionHeading';
import { PAGE_STRINGS } from './strings';
import type { CatalogCategoryPage, CatalogModelPage } from './types';

export interface SectionGroupProps {
  locale: 'ru' | 'en';
  section: 'cars' | 'bikes';
  /** Category of the group — its `SectionHeading`. No category — the
   *  models outside the categories: «Ещё модели» (`showMoreTitle`). */
  category?: CatalogCategoryPage;
  /** Models of the group (all of them — the heading's counter and price). */
  models: CatalogModelPage[];
  /** «Ещё модели» over a group without a category (off when it is the only one). */
  showMoreTitle?: boolean;
  /** id of the heading; the group is labelled by it. */
  id?: string;
  /** The group's cards (`ModelGrid`). */
  children: ReactNode;
}

/**
 * A group of a type page: its heading and its cards, groups spaced apart
 * (styles.css `.sb-mc-group + .sb-mc-group`). No models — nothing.
 */
export function SectionGroup({ locale, section, category, models, showMoreTitle = true, id, children }: SectionGroupProps) {
  if (models.length === 0) return null;
  const heading = category ? (
    <SectionHeading locale={locale} section={section} category={category} models={models} id={id} />
  ) : showMoreTitle ? (
    <div className="sb-mc-group__head">
      <h2 className="sb-mc-h2" id={id}>
        {PAGE_STRINGS[locale].moreModels}
      </h2>
    </div>
  ) : null;
  return (
    <section className="sb-mc-group" aria-labelledby={heading && id ? id : undefined}>
      {heading}
      {children}
    </section>
  );
}
