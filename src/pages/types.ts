// Public catalog API shapes of the site's model / category pages — mirror
// backend `apps/fleet/catalog_serializers.py`. The site imports them from here:
// the one compile-time check of the backend ↔ site contract (docs/site.md).
import type { CatalogCategory, CatalogVehicle } from '../blocks/VehicleCatalog';
import type { CatalogVehicleDetail } from '../blocks/catalog/VehicleBookingModal';

/** `CatalogModelCategorySerializer` — category of a model page. */
export interface CatalogModelPageCategory {
  id: string;
  slug: string;
  name: string;
  /** '' when the category is not translated — use `categoryLabel()`. */
  name_en: string;
}

/** `CatalogModelPageSerializer` — a row of `GET /catalog/models/`. */
export interface CatalogModelPage {
  slug: string;
  brand: string;
  name: string;
  /** «Zeekr 009» — what the page calls the model. */
  label: string;
  vehicle_type: CatalogVehicle['vehicle_type'];
  category: CatalogModelPageCategory | null;
  photo_url: string | null;
  /** Decimal string — `card_prices.per_day_min` of the representative unit. */
  price_from_per_day: string | null;
  /** Shortest rental (days) that gets `price_from_per_day`. */
  price_from_min_days: number | null;
  vehicle_count: number;
  available_today_count: number;
  has_text_ru: boolean;
  has_text_en: boolean;
  updated_at: string;
}

/** `CatalogImageSerializer` — an image of the vehicle gallery. */
export interface CatalogGalleryImage {
  image_url: string | null;
  /** 400px variant. */
  thumb_url: string | null;
  /** 1280px variant. */
  display_url: string | null;
  position: number;
}

/** A unit of the model page — exactly the vehicle detail response
 *  (`CatalogVehicleDetailSerializer`, with `trim`). */
export interface CatalogModelUnit extends Omit<CatalogVehicleDetail, 'gallery_images'> {
  gallery_images?: CatalogGalleryImage[];
}

/** `CatalogModelPageDetailSerializer` — `GET /catalog/models/<type>/<slug>/`. */
export interface CatalogModelPageDetail extends CatalogModelPage {
  description_ru: string;
  description_en: string;
  meta_description_ru: string;
  meta_description_en: string;
  units: CatalogModelUnit[];
  similar: CatalogModelPage[];
}

/** Old model address — the site answers 308 to `redirect_to`. */
export interface CatalogModelRedirect {
  redirect_to: string;
}

/** `CatalogCategoryPageSerializer` — a row of `GET /catalog/categories/`. */
export interface CatalogCategoryPage extends CatalogCategory {
  slug: string;
  h1: string;
  h1_en: string;
  intro: string;
  intro_en: string;
  meta_description: string;
  meta_description_en: string;
  section: 'cars' | 'bikes';
  /** Indexed page: ≥3 models with visible units + Russian h1 and intro. */
  is_published: boolean;
  has_text_ru: boolean;
  has_text_en: boolean;
}

/** One link of the breadcrumbs; no `href` — the current page. */
export interface Crumb {
  label: string;
  href?: string;
}
