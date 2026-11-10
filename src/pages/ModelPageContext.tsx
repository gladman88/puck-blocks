import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';
import {
  VehicleBookingModal,
  type VehicleBookingModalProps,
} from '../blocks/catalog/VehicleBookingModal';
import { todayISO } from '../blocks/catalog/dates';
import { buildVersions, defaultVersion, type ModelVersion } from './model';
import type { CatalogModelPageDetail } from './types';

/** What the HOST passes to open the booking window (same props the catalog
 *  block forwards to `VehicleBookingModal`). */
export type PageBookingConfig = Pick<
  VehicleBookingModalProps,
  'apiBase' | 'botUsername' | 'googleMapsApiKey' | 'referralCode' | 'telegramUser' | 'onTelegramLink'
>;

export interface ModelPageState {
  model: CatalogModelPageDetail;
  locale: 'ru' | 'en';
  /** Phuket day (ISO) the prices and seasons are read for. */
  today: string;
  versions: ModelVersion[];
  selected: ModelVersion | null;
  select: (key: string) => void;
  /** Opens the booking window (dates step) for the selected trim. */
  openBooking: () => void;
}

const ModelPageContext = createContext<ModelPageState | null>(null);

/** The model page state, or null outside `ModelPageProvider`. */
export function useModelPage(): ModelPageState | null {
  return useContext(ModelPageContext);
}

export interface ModelPageProviderProps {
  model: CatalogModelPageDetail;
  locale: 'ru' | 'en';
  booking: PageBookingConfig;
  /** ISO day for prices/seasons; default — today on Phuket. */
  today?: string;
  children: ReactNode;
}

/**
 * Shared state of a model page: the chosen trim (hero switcher, «Выбрать» of
 * the trims, the mobile bar, the season prices) and the booking window, which
 * opens straight on the dates step for the chosen trim's units.
 */
export function ModelPageProvider({ model, locale, booking, today, children }: ModelPageProviderProps) {
  const versions = useMemo(() => buildVersions(model.units), [model.units]);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const day = today ?? todayISO();

  const selected = useMemo(
    () => versions.find((v) => v.key === selectedKey) ?? defaultVersion(versions, model.default_unit_id),
    [versions, selectedKey, model.default_unit_id],
  );
  const select = useCallback((key: string) => setSelectedKey(key), []);
  const openBooking = useCallback(() => setOpen(true), []);

  const value = useMemo<ModelPageState>(
    () => ({ model, locale, today: day, versions, selected, select, openBooking }),
    [model, locale, day, versions, selected, select, openBooking],
  );

  return (
    <ModelPageContext.Provider value={value}>
      {children}
      {open && selected ? (
        <VehicleBookingModal
          {...booking}
          vehicle={selected.unit}
          unitIds={selected.units.map((u) => u.id)}
          locale={locale}
          initialStep="booking"
          onClose={() => setOpen(false)}
        />
      ) : null}
    </ModelPageContext.Provider>
  );
}
