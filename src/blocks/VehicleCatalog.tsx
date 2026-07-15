import { useEffect, useMemo, useRef, useState } from 'react';
import { Section } from '../components/Section';
import { VehicleBookingModal, type TelegramCatalogUser } from './catalog/VehicleBookingModal';
import { FilterBar, defaultFilterState, type CatalogFilterState } from './catalog/FilterBar';

export type { TelegramCatalogUser } from './catalog/VehicleBookingModal';
export type { CatalogFilterState, CatalogSortOption } from './catalog/FilterBar';

/**
 * Reflect the open card in the page URL (`?vehicle=<id>`) without a navigation, so
 * the address bar is shareable and a refresh reopens the card. replaceState (not
 * push) keeps Back from walking through card opens; other params/locale are kept.
 */
function setVehicleParam(id: string | null) {
  if (typeof window === 'undefined') return;
  const url = new URL(window.location.href);
  if (id) url.searchParams.set('vehicle', id);
  else url.searchParams.delete('vehicle');
  window.history.replaceState(null, '', url.toString());
}

// Mirrors the public catalog API shape (apps/fleet/catalog_serializers.py),
// reused from frontend_catalog so we don't reinvent the data layer.
export interface CatalogCategory {
  id: string;
  name: string;
  /** Optional English translation (public catalog/site only) — '' when the
   *  category hasn't been translated in FMS. Use `categoryLabel()` below
   *  rather than reading `name`/`name_en` directly, so every display site
   *  falls back to `name` consistently. */
  name_en?: string;
  color: string;
  vehicle_count: number;
}

/** Locale-aware category display name — falls back to `name` (ru) when
 *  `name_en` is unset/blank, so an untranslated category never renders empty
 *  on the English catalog. */
export function categoryLabel(category: Pick<CatalogCategory, 'name' | 'name_en'>, locale: 'ru' | 'en'): string {
  return locale === 'en' && category.name_en ? category.name_en : category.name;
}

export interface CatalogVehicle {
  id: string;
  display_name: string;
  brand: string;
  model: string;
  color: string;
  photo_url: string | null;
  vehicle_type: 'car' | 'motorcycle';
  year: number | null;
  category: CatalogCategory | null;
  min_price_per_day: number | null;
  is_available: boolean;
  free_from: string | null;
  free_from_time: string | null;
}

export interface VehicleCatalogProps {
  heading?: string;
  /** Section anchor id so the header nav can scroll here (e.g. "car"). */
  anchorId?: string;
  vehicleType?: 'car' | 'motorcycle';
  /** API origin; '' = relative path (proxied by the host app). */
  apiBase?: string;
  /** Telegram bot username for the quick-booking deep link in the card popup. */
  telegramBot?: string;
  /**
   * Google Maps JS API key for the delivery-address picker in the booking
   * popup (Stage 6, plans/paid-accessories/ §Stage 6). Infra config, not
   * page content — deliberately NOT a Puck-editable field; defaults to
   * `process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` (see config.tsx), same
   * pattern as frontend_fms's existing staff-only key. Undefined/empty →
   * the picker degrades to an "unavailable" message, never a broken widget.
   */
  googleMapsApiKey?: string;
  /**
   * Category name preselected on load and shown first in the tab row (e.g.
   * «Премиум» for cars, «Мотоциклы» for bikes). The «Все» tab is always last.
   * Empty / not found → «Все» is preselected. Ignored when `showFilters` is on
   * (the filter bar's own category picker takes over).
   */
  defaultCategory?: string;
  /**
   * Explicit locale override — takes priority over Puck's injected page
   * metadata locale (`puck.metadata.locale`). Needed by non-Puck hosts (e.g.
   * the standalone catalog's Vite shell), which never pass a `puck` prop at
   * all and so have no metadata locale to fall back on.
   */
  locale?: 'ru' | 'en';
  /**
   * Renders a full filter bar (type/category/search/availability date-range/
   * sort) above the grid, REPLACING the plain category-tab row. Off by
   * default — the site uses two fixed-type blocks (cars/bikes) with simple
   * tabs; the standalone catalog app (one block, all vehicle types, user
   * picks the type via the filter bar) turns this on. See
   * plans/catalog-on-puck-blocks/IMPLEMENTATION_PLAN.md §4.1a.
   */
  showFilters?: boolean;
  /**
   * Agent/referral attribution code (`?ref=`) — captured and persisted by the
   * HOST app (see frontend_catalog's useReferralCode). This component never
   * reads the URL/localStorage itself; the code is threaded into the booking
   * payload, the Telegram deep link, and the share link (VehicleBookingModal).
   */
  referralCode?: string | null;
  /**
   * Telegram Mini App user (from the host's `window.Telegram.WebApp.initData`)
   * — this component never reads `window.Telegram` itself. Used to prefill
   * the booking form (VehicleBookingModal).
   */
  telegramUser?: TelegramCatalogUser | null;
}

const STRINGS = {
  ru: {
    all: 'Все',
    from: 'от',
    perDay: '฿/день',
    busy: 'занята',
    freeFrom: 'свободна с',
    onRequest: 'по запросу',
    available: 'свободно',
    total: 'всего',
    viewAll: 'Смотреть весь каталог',
    empty: 'Нет доступных вариантов',
    loading: 'Загрузка…',
    error: 'Не удалось загрузить каталог',
    // Filter bar (showFilters=true only) — parity with frontend_catalog i18n.
    cars: 'Авто',
    motorcycles: 'Мото',
    category: 'Категория',
    search: 'Поиск...',
    sortDefault: 'Сортировка',
    sortPriceAsc: 'Дешевле',
    sortPriceDesc: 'Дороже',
    dateFrom: 'Дата с',
    dateTo: 'Дата по',
    clearFilters: 'Сбросить фильтры',
  },
  en: {
    all: 'All',
    from: 'from',
    perDay: '฿/day',
    busy: 'busy',
    freeFrom: 'free from',
    onRequest: 'on request',
    available: 'available',
    total: 'total',
    viewAll: 'View full catalog',
    empty: 'No vehicles available',
    loading: 'Loading…',
    error: 'Failed to load catalog',
    cars: 'Cars',
    motorcycles: 'Motorcycles',
    category: 'Category',
    search: 'Search...',
    sortDefault: 'Sort',
    sortPriceAsc: 'Cheapest',
    sortPriceDesc: 'Priciest',
    dateFrom: 'From date',
    dateTo: 'To date',
    clearFilters: 'Clear filters',
  },
} as const;

/** Query string for the filtered (showFilters) fetch. `sort` is deliberately
 *  NOT sent — the backend catalog endpoint ignores a `sort` param entirely
 *  (fixed ordering by category/price/brand/model); sorting is applied
 *  client-side below, same as the standalone catalog's VehicleGrid. */
function buildFilteredVehiclesUrl(apiBase: string, f: CatalogFilterState): string {
  const qs = new URLSearchParams();
  if (f.vehicleType) qs.set('vehicle_type', f.vehicleType);
  if (f.category) qs.set('category', f.category);
  if (f.search) qs.set('search', f.search);
  if (f.availableFrom) qs.set('available_from', f.availableFrom);
  if (f.availableTo) qs.set('available_to', f.availableTo);
  const s = qs.toString();
  return `${apiBase}/api/v1/catalog/vehicles/${s ? `?${s}` : ''}`;
}

interface VehicleGroup {
  /** Representative unit (cheapest available, or earliest-freeing if all busy). */
  vehicle: CatalogVehicle;
  total: number;
  availableCount: number;
}

// Group identical units (same brand/model/year/colour) into one card, mirroring
// frontend_catalog: the card shows a representative + a count, not one card per
// physical unit.
function groupVehicles(vehicles: CatalogVehicle[]): VehicleGroup[] {
  const groups = new Map<string, CatalogVehicle[]>();
  for (const v of vehicles) {
    const key = `${v.brand}:${v.model}:${v.year ?? ''}:${v.color ?? ''}`;
    const existing = groups.get(key);
    if (existing) existing.push(v);
    else groups.set(key, [v]);
  }

  return Array.from(groups.values()).map((group) => {
    const available = group.filter((v) => v.is_available);
    const availableCount = available.length;

    let representative: CatalogVehicle;
    if (availableCount === 0) {
      const withDate = group.filter((v) => v.free_from);
      const candidates = withDate.length > 0 ? withDate : group;
      representative = candidates.reduce((a, b) => {
        if (a.free_from !== b.free_from) return (a.free_from ?? '9999') <= (b.free_from ?? '9999') ? a : b;
        return (a.min_price_per_day ?? Infinity) <= (b.min_price_per_day ?? Infinity) ? a : b;
      });
    } else {
      const withPrice = available.filter((v) => v.min_price_per_day !== null);
      representative =
        withPrice.length > 0
          ? withPrice.reduce((a, b) => ((a.min_price_per_day ?? 0) <= (b.min_price_per_day ?? 0) ? a : b))
          : available[0];
    }

    return {
      vehicle: {
        ...representative,
        is_available: availableCount > 0,
        free_from: availableCount > 0 ? null : representative.free_from,
      },
      total: group.length,
      availableCount,
    };
  });
}

function formatDate(iso: string, locale: 'ru' | 'en'): string {
  try {
    return new Date(iso).toLocaleDateString(locale === 'ru' ? 'ru-RU' : 'en-GB', {
      day: '2-digit',
      month: 'short',
    });
  } catch {
    return iso;
  }
}

type PuckInjected = { puck?: { metadata?: { locale?: string } } };

/**
 * Live vehicle catalog section. Fetches vehicles + categories from the public
 * FMS catalog API (single source of truth), groups identical units into one
 * card (like frontend_catalog), with a per-section category filter. Used twice
 * (cars / bikes). Locale comes from Puck metadata (page locale).
 */
export function VehicleCatalog({
  heading,
  anchorId,
  vehicleType = 'car',
  apiBase = '',
  telegramBot = 'shiba_cars_test_bot',
  // Not a Puck field (see the prop's own docstring): the default reads the
  // HOST's own env at build time. It is deliberately NOT baked into Puck's
  // static `defaultProps` (config.tsx) — that would freeze the literal key
  // VALUE into every page's stored JSON forever, defeating key rotation.
  googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? '',
  defaultCategory,
  locale: localeProp,
  showFilters = false,
  referralCode,
  telegramUser,
  puck,
}: VehicleCatalogProps & PuckInjected) {
  const locale: 'ru' | 'en' = localeProp ?? (puck?.metadata?.locale === 'en' ? 'en' : 'ru');
  const t = STRINGS[locale];

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<CatalogVehicle | null>(null);

  // Filter-bar state (showFilters=true only — see FilterBar.tsx). `search` is
  // debounced 300ms before triggering a fetch; every other field is immediate
  // (mirrors frontend_catalog/App.tsx's apiFilters/handleFiltersChange).
  const [filters, setFilters] = useState<CatalogFilterState>(defaultFilterState);
  const [debouncedFilters, setDebouncedFilters] = useState<CatalogFilterState>(filters);

  const handleFiltersChange = (patch: Partial<CatalogFilterState>) => {
    setFilters((prev) => ({ ...prev, ...patch }));
  };

  // Drives `debouncedFilters` off `filters` as an effect (not inside the
  // setFilters updater above) — a setState updater must stay pure, and
  // scheduling a timer / calling another setState from inside one breaks
  // under React StrictMode's dev-mode double-invoke (double-fetch bug,
  // code review 2026-07-15). Only a lone `search` change debounces; any
  // other field (or a multi-field change, e.g. the filter-bar's "clear all")
  // applies immediately.
  const prevFiltersRef = useRef(filters);
  useEffect(() => {
    const prev = prevFiltersRef.current;
    prevFiltersRef.current = filters;
    const changedKeys = (Object.keys(filters) as (keyof CatalogFilterState)[]).filter(
      (key) => filters[key] !== prev[key],
    );
    const searchOnly = changedKeys.length === 1 && changedKeys[0] === 'search';
    if (searchOnly) {
      const timer = setTimeout(() => setDebouncedFilters(filters), 300);
      return () => clearTimeout(timer);
    }
    setDebouncedFilters(filters);
  }, [filters]);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setActiveCat(null);
    const headers = { 'ngrok-skip-browser-warning': 'true' };
    const vehiclesUrl = showFilters
      ? buildFilteredVehiclesUrl(apiBase, debouncedFilters)
      : `${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`;

    Promise.all([
      fetch(`${apiBase}/api/v1/catalog/categories/`, { headers }).then((r) =>
        r.ok ? (r.json() as Promise<CatalogCategory[]>) : [],
      ),
      fetch(vehiclesUrl, { headers }).then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<CatalogVehicle[]>;
      }),
    ])
      .then(([cats, list]) => {
        if (cancelled) return;
        const catList = Array.isArray(cats) ? cats : [];
        const vehList = Array.isArray(list) ? list : [];
        setCategories(catList);
        setVehicles(vehList);
        if (!showFilters) {
          // Preselect the configured default category (if present AND actually
          // used by a vehicle); otherwise fall back to «Все» (null). Filter-bar
          // mode drives category via `filters.category` instead — see below.
          const want = (defaultCategory ?? '').trim().toLowerCase();
          const usedIds = new Set(vehList.map((v) => v.category?.id).filter(Boolean));
          const def = want
            ? catList.find((c) => usedIds.has(c.id) && c.name.trim().toLowerCase() === want)
            : undefined;
          setActiveCat(def ? def.id : null);
        }
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicleType, defaultCategory, showFilters, debouncedFilters]);

  // Deep link: `?vehicle=<id>` opens the matching card once, after vehicles load.
  // Two catalog blocks (cars/bikes) each check their own list — only the block
  // that owns the vehicle opens it.
  const didDeepLink = useRef(false);
  useEffect(() => {
    if (didDeepLink.current || state !== 'ready') return;
    didDeepLink.current = true;
    if (typeof window === 'undefined') return;
    const id = new URLSearchParams(window.location.search).get('vehicle');
    if (!id) return;
    const match = vehicles.find((v) => v.id === id);
    if (!match) return;
    setSelected(match);
    // Scroll this block's section into view (cars vs bikes) so closing the modal
    // leaves the visitor in the right section. Runs behind the modal overlay.
    if (anchorId) {
      document.getElementById(anchorId)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [state, vehicles, anchorId]);

  // Keep the URL in sync with the open card. Guard on lastSyncedId so the sibling
  // block (which never opened anything) can't clear a deep-link param it didn't set.
  const lastSyncedId = useRef<string | null>(null);
  useEffect(() => {
    const id = selected?.id ?? null;
    if (id) {
      setVehicleParam(id);
      lastSyncedId.current = id;
    } else if (lastSyncedId.current) {
      setVehicleParam(null);
      lastSyncedId.current = null;
    }
  }, [selected]);

  const usedCats = new Set(
    vehicles.map((v) => v.category?.id).filter((id): id is string => Boolean(id)),
  );
  // Category tabs, default category moved to the front («Все» is rendered last,
  // separately).
  const tabs = useMemo(() => {
    const used = categories.filter((c) => usedCats.has(c.id));
    const want = (defaultCategory ?? '').trim().toLowerCase();
    if (!want) return used;
    const idx = used.findIndex((c) => c.name.trim().toLowerCase() === want);
    if (idx <= 0) return used;
    const copy = [...used];
    const [d] = copy.splice(idx, 1);
    return [d, ...copy];
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, vehicles, defaultCategory]);

  const groups = useMemo(() => {
    // Filter mode: `vehicles` already came back server-filtered by type/
    // category/search/dates (see buildFilteredVehiclesUrl) — regroup as-is.
    if (showFilters) return groupVehicles(vehicles);
    const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
    return groupVehicles(list);
  }, [vehicles, activeCat, showFilters]);

  // Client-side price sort (filter mode only) — the backend catalog endpoint
  // has no `sort` param, mirrors frontend_catalog's VehicleGrid sort.
  const displayGroups = useMemo(() => {
    if (!showFilters || filters.sort === 'default') return groups;
    const dir = filters.sort === 'price_asc' ? 1 : -1;
    return [...groups].sort((a, b) => {
      const pa = a.vehicle.min_price_per_day ?? Infinity;
      const pb = b.vehicle.min_price_per_day ?? Infinity;
      return (pa - pb) * dir;
    });
  }, [groups, showFilters, filters.sort]);

  return (
    <Section className="sb-vcatalog" id={anchorId || undefined}>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}

      {showFilters ? (
        <FilterBar
          filters={filters}
          categories={categories}
          onChange={handleFiltersChange}
          strings={t}
          locale={locale}
        />
      ) : state === 'ready' && tabs.length > 0 ? (
        <div className="sb-vcatalog__tabs">
          {tabs.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`sb-vcatalog__tab ${activeCat === c.id ? 'sb-vcatalog__tab--active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {categoryLabel(c, locale)}
            </button>
          ))}
          <button
            type="button"
            className={`sb-vcatalog__tab ${activeCat === null ? 'sb-vcatalog__tab--active' : ''}`}
            onClick={() => setActiveCat(null)}
          >
            {t.all}
          </button>
        </div>
      ) : null}

      {state === 'loading' ? <p className="sb-vcatalog__state">{t.loading}</p> : null}
      {state === 'error' ? <p className="sb-vcatalog__state">{t.error}</p> : null}

      {state === 'ready' &&
        (displayGroups.length === 0 ? (
          <p className="sb-vcatalog__state">{t.empty}</p>
        ) : (
          <div className="sb-vcatalog__grid">
            {displayGroups.map((g) => {
              const v = g.vehicle;
              const countLabel =
                g.total > 1
                  ? g.availableCount > 0
                    ? `${g.availableCount} ${t.available}`
                    : `${g.total} ${t.total}`
                  : null;
              return (
                <button type="button" className="sb-vcard" key={v.id} onClick={() => setSelected(v)}>
                <div className="sb-vcard__media">
                  {v.photo_url ? <img src={v.photo_url} alt={v.display_name} loading="lazy" /> : null}
                  {v.category && (showFilters || activeCat === null) ? (
                    // Tab mode: badge only makes sense on «Все» — on a specific
                    // category tab every card is that category, so it's just
                    // noise. Filter mode has no such tab (parity with the
                    // standalone catalog's VehicleCard, which always shows it).
                    <span className="sb-vcard__badge" style={{ backgroundColor: v.category.color }}>
                      {categoryLabel(v.category, locale)}
                    </span>
                  ) : null}
                  {countLabel ? <span className="sb-vcard__count">{countLabel}</span> : null}
                  <div className="sb-vcard__overlay">
                    {!v.is_available ? (
                      <span className="sb-vcard__status">
                        {v.free_from ? `${t.freeFrom} ${formatDate(v.free_from, locale)}` : t.busy}
                      </span>
                    ) : null}
                    <h3 className="sb-vcard__name">{v.display_name}</h3>
                    <div className="sb-vcard__meta">
                      <span className="sb-vcard__year">
                        {v.year ?? ''}
                        {v.is_available ? <span className="sb-dot" /> : null}
                      </span>
                      <span className="sb-vcard__price">
                        {v.min_price_per_day !== null ? (
                          <>
                            <small>{t.from} </small>
                            {Math.round(v.min_price_per_day).toLocaleString('en-US')}
                            <small> {t.perDay}</small>
                          </>
                        ) : (
                          <small>{t.onRequest}</small>
                        )}
                      </span>
                    </div>
                  </div>
                </div>
                </button>
              );
            })}
          </div>
        ))}

      {selected ? (
        <VehicleBookingModal
          vehicle={selected}
          apiBase={apiBase}
          locale={locale}
          botUsername={telegramBot.trim() || 'shiba_cars_test_bot'}
          googleMapsApiKey={googleMapsApiKey}
          referralCode={referralCode}
          telegramUser={telegramUser}
          onClose={() => setSelected(null)}
        />
      ) : null}
    </Section>
  );
}
