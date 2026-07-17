import { useState } from 'react';
import { categoryLabel, type CatalogCategory } from '../VehicleCatalog';
import { formatDDMMYYYY, nextDay, openNativeDatePicker, todayISO } from './dates';

export type CatalogSortOption = 'default' | 'price_asc' | 'price_desc';

/**
 * Live filter state for the standalone-catalog view (`showFilters=true`).
 * `vehicleType: undefined` means "Все" (no type filter, both cars and bikes) —
 * this state is entirely separate from the site's per-block `vehicleType` prop.
 */
export interface CatalogFilterState {
  vehicleType?: 'car' | 'motorcycle';
  category?: string;
  search?: string;
  availableFrom?: string;
  availableTo?: string;
  sort: CatalogSortOption;
}

export function defaultFilterState(): CatalogFilterState {
  // Must list EVERY field — the clear-filters button sends this whole object as
  // the patch, so an omitted key (previously availableFrom/availableTo) would
  // survive the merge and the reset would silently leave the dates set.
  return {
    vehicleType: undefined,
    category: undefined,
    search: undefined,
    availableFrom: undefined,
    availableTo: undefined,
    sort: 'default',
  };
}


export interface FilterBarStrings {
  all: string;
  cars: string;
  motorcycles: string;
  category: string;
  search: string;
  sortDefault: string;
  sortPriceAsc: string;
  sortPriceDesc: string;
  dateFrom: string;
  dateTo: string;
  clearFilters: string;
}

interface Props {
  filters: CatalogFilterState;
  categories: CatalogCategory[];
  onChange: (patch: Partial<CatalogFilterState>) => void;
  strings: FilterBarStrings;
  locale: 'ru' | 'en';
}

/**
 * Full filter bar for the standalone catalog (type/category/search/date-range/
 * sort) — ported from frontend_catalog/src/components/FilterBar.tsx onto
 * sb-*-CSS (no Tailwind/lucide in puck-blocks; icons are small inline SVGs,
 * matching the stroke style already used by VehicleBookingModal's share icon).
 * Hidden entirely when VehicleCatalogProps.showFilters is false (the site's
 * category-tabs-only view is unaffected — see VehicleCatalog.tsx).
 */
export function FilterBar({ filters, categories, onChange, strings: t, locale }: Props) {
  const [categoryOpen, setCategoryOpen] = useState(false);
  const today = todayISO();

  const handleFromChange = (value: string) => {
    // Auto-adjust "to" if it's on or before the new "from" (parity with the
    // standalone's handleFromChange) — both fields change together → immediate,
    // not debounced (only a lone `search` edit debounces, see VehicleCatalog).
    const patch: Partial<CatalogFilterState> = { availableFrom: value || undefined };
    if (filters.availableTo && value && filters.availableTo <= value) {
      patch.availableTo = nextDay(value);
    }
    onChange(patch);
  };

  const hasActiveFilters = Boolean(
    filters.search || filters.vehicleType || filters.category ||
    filters.availableFrom || filters.availableTo || (filters.sort && filters.sort !== 'default'),
  );

  const activeCategory = categories.find((c) => c.id === filters.category);

  const cycleSort = () => {
    const order: CatalogSortOption[] = ['default', 'price_asc', 'price_desc'];
    const next = order[(order.indexOf(filters.sort) + 1) % order.length];
    onChange({ sort: next });
  };
  const sortLabel =
    filters.sort === 'price_asc' ? t.sortPriceAsc : filters.sort === 'price_desc' ? t.sortPriceDesc : t.sortDefault;

  return (
    <div className="sb-filterbar">
      <div className="sb-filterbar__search">
        <svg className="sb-filterbar__search-ico" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="sb-input sb-filterbar__search-input"
          value={filters.search || ''}
          onChange={(e) => onChange({ search: e.target.value || undefined })}
          placeholder={t.search}
          aria-label={t.search}
        />
      </div>

      <div className="sb-filterbar__row">
        <button
          type="button"
          className={`sb-filterbar__pill ${!filters.vehicleType && !filters.category ? 'is-active' : ''}`}
          onClick={() => onChange({ vehicleType: undefined, category: undefined })}
        >
          {t.all}
        </button>
        <button
          type="button"
          className={`sb-filterbar__pill ${filters.vehicleType === 'car' && !filters.category ? 'is-active' : ''}`}
          onClick={() => onChange({ vehicleType: 'car', category: undefined })}
        >
          {t.cars}
        </button>
        <button
          type="button"
          className={`sb-filterbar__pill ${filters.vehicleType === 'motorcycle' && !filters.category ? 'is-active' : ''}`}
          onClick={() => onChange({ vehicleType: 'motorcycle', category: undefined })}
        >
          {t.motorcycles}
        </button>

        {categories.length > 0 ? (
          <button
            type="button"
            className={`sb-filterbar__pill ${filters.category ? 'is-active' : ''}`}
            style={activeCategory ? { backgroundColor: activeCategory.color, borderColor: 'transparent' } : undefined}
            onClick={() => setCategoryOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="4" y1="6" x2="20" y2="6" />
              <line x1="4" y1="12" x2="20" y2="12" />
              <line x1="4" y1="18" x2="20" y2="18" />
              <circle cx="8" cy="6" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="12" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="10" cy="18" r="1.5" fill="currentColor" stroke="none" />
            </svg>
            {activeCategory ? categoryLabel(activeCategory, locale) : t.category}
          </button>
        ) : null}

        {hasActiveFilters ? (
          <button
            type="button"
            className="sb-filterbar__clear"
            onClick={() => {
              onChange(defaultFilterState());
              setCategoryOpen(false);
            }}
            aria-label={t.clearFilters}
          >
            <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        ) : null}
      </div>

      {categoryOpen ? (
        <div className="sb-filterbar__categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`sb-filterbar__pill ${filters.category === cat.id ? 'is-active' : ''}`}
              style={
                filters.category === cat.id
                  ? { backgroundColor: cat.color, borderColor: 'transparent' }
                  : { backgroundColor: `${cat.color}1f`, borderColor: `${cat.color}33` }
              }
              onClick={() => {
                onChange({ category: filters.category === cat.id ? undefined : cat.id, vehicleType: undefined });
                setCategoryOpen(false);
              }}
            >
              {categoryLabel(cat, locale)}
            </button>
          ))}
        </div>
      ) : null}

      <div className="sb-filterbar__row">
        <svg className="sb-filterbar__cal-ico" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          <rect x="3" y="4" width="18" height="18" rx="2" />
          <line x1="16" y1="2" x2="16" y2="6" />
          <line x1="8" y1="2" x2="8" y2="6" />
          <line x1="3" y1="10" x2="21" y2="10" />
        </svg>
        {/* Date "chip": we render our own numeric ДД.ММ.ГГГГ label at a stable
            width and overlay a transparent native <input type="date"> so a tap
            still opens the native picker. This sidesteps iOS painting the value
            in an uncontrollable "17 Jul 2026" format that wraps + collapses the
            row (see styles.css). Empty → a muted placeholder, same width. */}
        <label className="sb-filterbar__datechip">
          <span className={`sb-filterbar__datechip-val${filters.availableFrom ? '' : ' sb-filterbar__datechip-val--ph'}`}>
            {filters.availableFrom ? formatDDMMYYYY(filters.availableFrom) : t.dateFrom}
          </span>
          <input
            type="date"
            className="sb-filterbar__datechip-input"
            aria-label={t.dateFrom}
            value={filters.availableFrom || ''}
            min={today}
            onClick={(e) => openNativeDatePicker(e.currentTarget)}
            onChange={(e) => handleFromChange(e.target.value)}
          />
        </label>
        <span className="sb-filterbar__date-sep">—</span>
        <label className="sb-filterbar__datechip">
          <span className={`sb-filterbar__datechip-val${filters.availableTo ? '' : ' sb-filterbar__datechip-val--ph'}`}>
            {filters.availableTo ? formatDDMMYYYY(filters.availableTo) : t.dateTo}
          </span>
          <input
            type="date"
            className="sb-filterbar__datechip-input"
            aria-label={t.dateTo}
            value={filters.availableTo || ''}
            min={filters.availableFrom ? nextDay(filters.availableFrom) : nextDay(today)}
            onClick={(e) => openNativeDatePicker(e.currentTarget)}
            onChange={(e) => onChange({ availableTo: e.target.value || undefined })}
          />
        </label>

        <button type="button" className="sb-filterbar__sort" onClick={cycleSort}>
          <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
            <line x1="3" y1="6" x2="9" y2="6" />
            <line x1="3" y1="12" x2="7" y2="12" />
            <line x1="3" y1="18" x2="5" y2="18" />
            <path d="M17 4v16m0 0-4-4m4 4 4-4" />
          </svg>
          <span className={filters.sort !== 'default' ? 'sb-filterbar__sort-active' : ''}>{sortLabel}</span>
        </button>
      </div>
    </div>
  );
}
