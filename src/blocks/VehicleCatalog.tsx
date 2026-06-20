import { useEffect, useMemo, useState } from 'react';
import { Section } from '../components/Section';
import { VehicleBookingModal } from './catalog/VehicleBookingModal';

// Mirrors the public catalog API shape (apps/fleet/catalog_serializers.py),
// reused from frontend_catalog so we don't reinvent the data layer.
export interface CatalogCategory {
  id: string;
  name: string;
  color: string;
  vehicle_count: number;
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
   * Category name preselected on load and shown first in the tab row (e.g.
   * «Премиум» for cars, «Мотоциклы» for bikes). The «Все» tab is always last.
   * Empty / not found → «Все» is preselected.
   */
  defaultCategory?: string;
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
  },
} as const;

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
  defaultCategory,
  puck,
}: VehicleCatalogProps & PuckInjected) {
  const locale: 'ru' | 'en' = puck?.metadata?.locale === 'en' ? 'en' : 'ru';
  const t = STRINGS[locale];

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');
  const [selected, setSelected] = useState<CatalogVehicle | null>(null);

  useEffect(() => {
    let cancelled = false;
    setState('loading');
    setActiveCat(null);
    const headers = { 'ngrok-skip-browser-warning': 'true' };

    Promise.all([
      fetch(`${apiBase}/api/v1/catalog/categories/`, { headers }).then((r) =>
        r.ok ? (r.json() as Promise<CatalogCategory[]>) : [],
      ),
      fetch(`${apiBase}/api/v1/catalog/vehicles/?vehicle_type=${vehicleType}`, { headers }).then(
        (r) => {
          if (!r.ok) throw new Error(String(r.status));
          return r.json() as Promise<CatalogVehicle[]>;
        },
      ),
    ])
      .then(([cats, list]) => {
        if (cancelled) return;
        const catList = Array.isArray(cats) ? cats : [];
        const vehList = Array.isArray(list) ? list : [];
        setCategories(catList);
        setVehicles(vehList);
        // Preselect the configured default category (if present AND actually
        // used by a vehicle); otherwise fall back to «Все» (null).
        const want = (defaultCategory ?? '').trim().toLowerCase();
        const usedIds = new Set(vehList.map((v) => v.category?.id).filter(Boolean));
        const def = want
          ? catList.find((c) => usedIds.has(c.id) && c.name.trim().toLowerCase() === want)
          : undefined;
        setActiveCat(def ? def.id : null);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicleType, defaultCategory]);

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
    const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
    return groupVehicles(list);
  }, [vehicles, activeCat]);

  return (
    <Section className="sb-vcatalog" id={anchorId || undefined}>
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}

      {state === 'ready' && tabs.length > 0 ? (
        <div className="sb-vcatalog__tabs">
          {tabs.map((c) => (
            <button
              key={c.id}
              type="button"
              className={`sb-vcatalog__tab ${activeCat === c.id ? 'sb-vcatalog__tab--active' : ''}`}
              onClick={() => setActiveCat(c.id)}
            >
              {c.name}
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
        (groups.length === 0 ? (
          <p className="sb-vcatalog__state">{t.empty}</p>
        ) : (
          <div className="sb-vcatalog__grid">
            {groups.map((g) => {
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
                  {v.category && activeCat === null ? (
                    // Badge only makes sense on «Все» — on a specific category tab
                    // every card is that category, so it's just noise.
                    <span className="sb-vcard__badge" style={{ backgroundColor: v.category.color }}>
                      {v.category.name}
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
          onClose={() => setSelected(null)}
        />
      ) : null}
    </Section>
  );
}
