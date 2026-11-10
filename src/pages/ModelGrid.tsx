import { useMemo, useState } from 'react';
import {
  STRINGS as CATALOG_STRINGS,
  categoryLabel,
  groupVehicles,
  orderCatalogCards,
  vehicleGroupKey,
  vehicleModelHref,
  type CatalogVehicle,
  type VehicleGroup,
} from '../blocks/VehicleCatalog';
import { VehicleCard } from '../blocks/catalog/VehicleCard';
import { VehicleBookingModal } from '../blocks/catalog/VehicleBookingModal';
import type { PageBookingConfig } from './ModelPageContext';

export interface ModelGridProps {
  /** Public catalog list (`GET /catalog/vehicles/?vehicle_type=`). */
  vehicles: CatalogVehicle[];
  locale: 'ru' | 'en';
  booking: PageBookingConfig;
  /** Only these models (slugs) — e.g. the similar models of a model page. */
  onlySlugs?: string[];
  /** Only this category. */
  categoryId?: string;
  /** At most this many cards. */
  limit?: number;
  /** Category on the cards (off on a category page — every card is it). */
  showCategory?: boolean;
  /** Section heading (e.g. «Похожие модели»): with it the grid draws its own
   *  section; no cards — nothing at all, neither the section nor the heading. */
  title?: string;
  /** Small line above `title`. */
  eyebrow?: string;
}

/** One card per model: units grouped by `vehicle_model` (a unit without one —
 *  by brand/model/year/colour, like the catalog). */
const modelKey = (v: CatalogVehicle) =>
  v.vehicle_model?.slug ? `m:${v.vehicle_model.slug}` : `g:${vehicleGroupKey(v)}`;

/**
 * Grid of catalog cards, one per model (category and type pages, similar
 * models). Order — `orderCatalogCards` (free today → cheaper). Each card links
 * to its model page (`href`, crawlable), a plain click opens the vehicle window
 * in place — as on the home page.
 */
export function ModelGrid({
  vehicles,
  locale,
  booking,
  onlySlugs,
  categoryId,
  limit,
  showCategory = true,
  title,
  eyebrow,
}: ModelGridProps) {
  const t = CATALOG_STRINGS[locale];
  const [open, setOpen] = useState<VehicleGroup | null>(null);

  const cards = useMemo(() => {
    const slugs = onlySlugs ? new Set(onlySlugs) : null;
    const list = vehicles.filter(
      (v) =>
        (!slugs || (v.vehicle_model?.slug && slugs.has(v.vehicle_model.slug))) &&
        (!categoryId || v.category?.id === categoryId),
    );
    const ordered = orderCatalogCards(groupVehicles(list, modelKey));
    return limit !== undefined ? ordered.slice(0, limit) : ordered;
  }, [vehicles, onlySlugs, categoryId, limit]);

  if (cards.length === 0) return null;

  const grid = (
    <>
      <div className="sb-vcatalog__grid">
        {cards.map((c) => (
          <VehicleCard
            key={c.vehicle.id}
            vehicle={c.vehicle}
            total={c.total}
            availableCount={c.availableCount}
            categoryName={showCategory && c.vehicle.category ? categoryLabel(c.vehicle.category, locale) : null}
            hasCompleteDateRange={false}
            locale={locale}
            strings={t}
            referralCode={booking.referralCode}
            onOpen={() => setOpen(c)}
            href={vehicleModelHref(c.vehicle, locale)}
          />
        ))}
      </div>
      {open ? (
        <VehicleBookingModal
          {...booking}
          vehicle={open.vehicle}
          unitIds={open.units.map((u) => u.id)}
          locale={locale}
          onClose={() => setOpen(null)}
        />
      ) : null}
    </>
  );
  if (!title) return grid;
  return (
    <section className="sb-section sb-mp-sec">
      <div className="sb-container">
        {eyebrow ? <p className="sb-mp-eyebrow">{eyebrow}</p> : null}
        <h2 className="sb-h2">{title}</h2>
        {grid}
      </div>
    </section>
  );
}
