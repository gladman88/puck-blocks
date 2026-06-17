import { useEffect, useState } from 'react';
import { Section } from '../components/Section';
import { safeHref } from '../sanitize';

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
  photo_url: string | null;
  vehicle_type: 'car' | 'motorcycle';
  year: number | null;
  category: CatalogCategory | null;
  min_price_per_day: number | null;
  is_available: boolean;
  free_from: string | null;
}

export interface VehicleCatalogProps {
  heading?: string;
  vehicleType?: 'car' | 'motorcycle';
  /** API origin; '' = relative path (proxied by the host app). */
  apiBase?: string;
  /** Link to the full catalog app (card click + "view all"). */
  catalogUrl?: string;
}

const STRINGS = {
  ru: {
    all: 'Все',
    from: 'от',
    perDay: '฿/день',
    busy: 'занята',
    freeFrom: 'свободна с',
    onRequest: 'по запросу',
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
    viewAll: 'View full catalog',
    empty: 'No vehicles available',
    loading: 'Loading…',
    error: 'Failed to load catalog',
  },
} as const;

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
 * FMS catalog API (single source of truth — prices/availability are never
 * hand-entered), with a per-section category filter. Used twice (cars / bikes).
 * Locale comes from Puck metadata passed by the host (page locale).
 */
export function VehicleCatalog({
  heading,
  vehicleType = 'car',
  apiBase = '',
  catalogUrl,
  puck,
}: VehicleCatalogProps & PuckInjected) {
  const locale: 'ru' | 'en' = puck?.metadata?.locale === 'en' ? 'en' : 'ru';
  const t = STRINGS[locale];

  const [categories, setCategories] = useState<CatalogCategory[]>([]);
  const [vehicles, setVehicles] = useState<CatalogVehicle[]>([]);
  const [activeCat, setActiveCat] = useState<string | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

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
        setCategories(Array.isArray(cats) ? cats : []);
        setVehicles(Array.isArray(list) ? list : []);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });

    return () => {
      cancelled = true;
    };
  }, [apiBase, vehicleType]);

  const usedCats = new Set(
    vehicles.map((v) => v.category?.id).filter((id): id is string => Boolean(id)),
  );
  const tabs = categories.filter((c) => usedCats.has(c.id));
  const list = activeCat ? vehicles.filter((v) => v.category?.id === activeCat) : vehicles;
  const base = safeHref(catalogUrl);

  return (
    <Section className="sb-vcatalog">
      {heading ? <h2 className="sb-h2">{heading}</h2> : null}

      {state === 'ready' && tabs.length > 0 ? (
        <div className="sb-vcatalog__tabs">
          <button
            type="button"
            className={`sb-vcatalog__tab ${activeCat === null ? 'sb-vcatalog__tab--active' : ''}`}
            onClick={() => setActiveCat(null)}
          >
            {t.all}
          </button>
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
        </div>
      ) : null}

      {state === 'loading' ? <p className="sb-vcatalog__state">{t.loading}</p> : null}
      {state === 'error' ? <p className="sb-vcatalog__state">{t.error}</p> : null}

      {state === 'ready' &&
        (list.length === 0 ? (
          <p className="sb-vcatalog__state">{t.empty}</p>
        ) : (
          <div className="sb-vcatalog__grid">
            {list.map((v) => {
              const href = base
                ? `${base}${base.includes('?') ? '&' : '?'}vehicle=${encodeURIComponent(v.id)}`
                : undefined;
              const media = (
                <div className="sb-vcard__media">
                  {v.photo_url ? <img src={v.photo_url} alt={v.display_name} loading="lazy" /> : null}
                  {v.category ? (
                    <span className="sb-vcard__badge" style={{ backgroundColor: v.category.color }}>
                      {v.category.name}
                    </span>
                  ) : null}
                  {!v.is_available ? (
                    <span className="sb-vcard__chip">
                      {v.free_from ? `${t.freeFrom} ${formatDate(v.free_from, locale)}` : t.busy}
                    </span>
                  ) : null}
                  <div className="sb-vcard__overlay">
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
              );
              return href ? (
                <a className="sb-vcard" key={v.id} href={href}>
                  {media}
                </a>
              ) : (
                <div className="sb-vcard" key={v.id}>
                  {media}
                </div>
              );
            })}
          </div>
        ))}

      {state === 'ready' && base ? (
        <div className="sb-vcatalog__foot">
          <a className="sb-btn sb-btn--ghost" href={base}>
            {t.viewAll}
          </a>
        </div>
      ) : null}
    </Section>
  );
}
