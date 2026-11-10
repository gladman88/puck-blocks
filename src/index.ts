export { puckConfig } from './config';
export type { Props, RootProps } from './config';

export { ContactIcon } from './components/ContactIcon';
export type { ContactKind } from './components/ContactIcon';

export { LanguageSwitcher } from './components/LanguageSwitcher';
export type { LanguageSwitcherProps, SiteLocale } from './components/LanguageSwitcher';

export { Hero } from './blocks/Hero';
export type { HeroProps } from './blocks/Hero';

export { RichText } from './blocks/RichText';
export type { RichTextProps } from './blocks/RichText';

export { StatCounters } from './blocks/StatCounters';
export type { StatCountersProps, StatItem } from './blocks/StatCounters';

export { AboutPromo } from './blocks/AboutPromo';
export type { AboutPromoProps } from './blocks/AboutPromo';

export { FeatureCards } from './blocks/FeatureCards';
export type { FeatureCardsProps, FeatureItem } from './blocks/FeatureCards';

export { TermsAccordion } from './blocks/TermsAccordion';
export type { TermsAccordionProps, TermItem } from './blocks/TermsAccordion';

export { ReviewsCarousel } from './blocks/ReviewsCarousel';
export type { ReviewsCarouselProps, TextReview, MediaReview } from './blocks/ReviewsCarousel';

export { SiteHeader, withLinkBase } from './blocks/SiteHeader';
export type { SiteHeaderProps, NavLink } from './blocks/SiteHeader';

export { Footer } from './blocks/Footer';
export type { FooterProps } from './blocks/Footer';

export { LeadForm } from './blocks/LeadForm';
export type { LeadFormProps } from './blocks/LeadForm';

export {
  VehicleCatalog,
  categoryLabel,
  orderCatalogCards,
  vehicleModelHref,
  vehicleGroupKey,
  groupVehicles,
  pickRepresentative,
  STRINGS as CATALOG_STRINGS,
} from './blocks/VehicleCatalog';
export type {
  VehicleCatalogProps,
  CatalogVehicle,
  CatalogCategory,
  CatalogPreload,
  CardPrices,
  VehicleGroup,
  TelegramCatalogUser,
  CatalogFilterState,
  CatalogSortOption,
} from './blocks/VehicleCatalog';

// Catalog parts reused by the site's model / category pages (no copies there).
export { VehicleCard, formatCardDate } from './blocks/catalog/VehicleCard';
export type { VehicleCardProps, VehicleCardStrings } from './blocks/catalog/VehicleCard';

export { CardPriceOverlay, CardTitle } from './blocks/catalog/CardPriceOverlay';
export type {
  CardPriceOverlayProps,
  CardPriceOverlayStrings,
  CardStatusTone,
} from './blocks/catalog/CardPriceOverlay';

export { PriceGrid, periodLabel, seasonLabel, isCurrentSeason } from './blocks/catalog/PriceGrid';
export type { PriceGridProps, PricingPeriod, PricingSeason } from './blocks/catalog/PriceGrid';

export { buildSpecRows } from './blocks/catalog/specs';
export type { VehicleSpecs, SpecRow } from './blocks/catalog/specs';

export { formatBahtCeil, formatMoney, formatDayPrice } from './blocks/catalog/price';

export { VehicleBookingModal } from './blocks/catalog/VehicleBookingModal';
export type { VehicleBookingModalProps, CatalogVehicleDetail } from './blocks/catalog/VehicleBookingModal';

export { MapContacts } from './blocks/MapContacts';
export type { MapContactsProps } from './blocks/MapContacts';

// Model / category / type pages of the site (components, not Puck blocks).
export * from './pages';
