import { Fragment } from 'react';
import { PAGE_STRINGS } from './strings';
import type { Crumb } from './types';

/** «Главная / Автомобили / Zeekr 009» — the last crumb (no `href`) is the page. */
export function Breadcrumbs({ crumbs, locale }: { crumbs: Crumb[]; locale: 'ru' | 'en' }) {
  if (crumbs.length === 0) return null;
  return (
    <nav className="sb-mp-crumbs" aria-label={PAGE_STRINGS[locale].breadcrumbs}>
      {crumbs.map((c, i) => (
        <Fragment key={`${i}-${c.label}`}>
          {i > 0 ? <span aria-hidden="true">/</span> : null}
          {c.href ? <a href={c.href}>{c.label}</a> : <b aria-current="page">{c.label}</b>}
        </Fragment>
      ))}
    </nav>
  );
}
