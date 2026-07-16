import { useEffect, useRef, useState } from 'react';

/** A Google Place picked via the delivery-address picker (Stage 6, plan §Stage
 *  6) — matches the backend's `_GooglePlaceLocationField` contract exactly
 *  (address + numeric lat/lng required, place_id/name optional). Same shape
 *  as frontend_catalog's `PickedLocation`. */
export interface PickedLocation {
  address: string;
  lat: number;
  lng: number;
  place_id?: string;
  name?: string;
}

// Default map view — Phuket, matching the FMS location picker
// (frontend_fms/src/hooks/useLocationPicker.ts) so the two surfaces behave
// the same ("как в системе").
const DEFAULT_CENTER = { lat: 7.8804, lng: 98.3923 };
const DEFAULT_ZOOM = 11;
const SELECTED_ZOOM = 16;

// Minimal ambient shapes for the pieces of the Google Maps JS API this file
// touches — puck-blocks has no @types/google.maps dependency (this is the only
// Google Maps integration in this repo), so a full typed surface isn't worth
// adding. `google` itself comes from the host page's bootstrap loader script
// (see the site/catalog layout that renders this block).
interface GoogleLatLng {
  lat: () => number;
  lng: () => number;
}
interface GooglePlace {
  formattedAddress?: string;
  displayName?: string;
  id?: string;
  location?: GoogleLatLng;
  fetchFields: (opts: { fields: string[] }) => Promise<void>;
}
interface GooglePlacePrediction {
  toPlace: () => GooglePlace;
}
// `new Place({ id })` — used to resolve a POI clicked on the map into its real
// name + canonical location (rather than reverse-geocoding the raw click point).
type GooglePlaceCtor = new (opts: { id: string }) => GooglePlace;
type GmpSelectListener = (event: { placePrediction: GooglePlacePrediction }) => void;
// Deliberately NOT `extends HTMLElement` — the real element IS one (it's a
// custom element instance), but typing addEventListener/removeEventListener
// with a non-standard event name conflicts with HTMLElement's own overloads.
// DOM insertion/removal below casts through `unknown` instead.
interface GooglePlaceAutocompleteElement {
  addEventListener: (type: 'gmp-select', listener: GmpSelectListener) => void;
  removeEventListener: (type: 'gmp-select', listener: GmpSelectListener) => void;
}
interface GoogleMapMouseEvent {
  latLng?: GoogleLatLng | null;
  // Present when a POI icon (a labelled place, not empty map) was clicked —
  // an IconMouseEvent. `stop()` suppresses Google's default POI info window.
  placeId?: string;
  stop?: () => void;
}
interface GoogleMapMarker {
  setPosition: (pos: { lat: number; lng: number }) => void;
  setMap: (map: GoogleMap | null) => void;
}
type GoogleMarkerCtor = new (opts: { map: GoogleMap; position: { lat: number; lng: number } }) => GoogleMapMarker;
interface GoogleMap {
  panTo: (pos: { lat: number; lng: number }) => void;
  setZoom: (zoom: number) => void;
  addListener: (event: 'click', handler: (e: GoogleMapMouseEvent) => void) => void;
}
interface GoogleGeocoderResult {
  formatted_address?: string;
  place_id?: string;
}
interface GoogleGeocoder {
  geocode: (
    request: { location: { lat: number; lng: number } },
    callback: (results: GoogleGeocoderResult[] | null, status: string) => void,
  ) => void;
}
interface GoogleMapsNamespace {
  importLibrary: (name: string) => Promise<{
    PlaceAutocompleteElement?: new () => GooglePlaceAutocompleteElement;
    Place?: GooglePlaceCtor;
    Map?: new (el: HTMLElement, opts: Record<string, unknown>) => GoogleMap;
    Marker?: GoogleMarkerCtor;
    Geocoder?: new () => GoogleGeocoder;
  }>;
}
declare global {
  interface Window {
    google?: { maps: GoogleMapsNamespace };
  }
}

interface DeliveryAddressPickerProps {
  /** Empty/undefined → the picker never attempts to load (no key configured
   *  for this deployment yet). Shows `unavailableText` instead. */
  apiKey: string | undefined;
  /** The currently-picked location (so the marker reflects the value chosen
   *  either via search or a previous map tap). */
  value: PickedLocation | null;
  onSelect: (location: PickedLocation) => void;
  strings: {
    unavailable: string;
    loading: string;
    /** "Выбрать на карте" — expands the inline map. */
    showMap: string;
    /** "Скрыть карту". */
    hideMap: string;
    /** "Нажмите на карту, чтобы выбрать точку". */
    mapHint: string;
  };
}

/**
 * Google Places address picker (Stage 6) — mirrors the FMS location picker
 * (`frontend_fms/src/components/location-picker.tsx`) so both surfaces feel the
 * same ("как в системе"): search a place by name AND/OR tap a point on an
 * expandable map (reverse-geocoded to a real address). Framework-neutral —
 * built on the raw Google Maps JS API (`importLibrary`), NOT
 * `@react-google-maps/api`, because puck-blocks ships its own `sb-` CSS and
 * has no React-Google-Maps dependency.
 *
 * Deliberately uses the modern `PlaceAutocompleteElement` web component (the
 * legacy `Autocomplete` class the FMS uses is closed to API keys enabled after
 * March 2025, so the fresh public-site key can't use it). The map tap path
 * needs the **Geocoding API** enabled on the key for reverse geocoding; if it
 * isn't, the tap still works and falls back to a `"lat, lng"` address (same
 * graceful degradation the FMS uses).
 */
export function DeliveryAddressPicker({ apiKey, value, onSelect, strings }: DeliveryAddressPickerProps) {
  const acContainerRef = useRef<HTMLDivElement>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMapMarker | null>(null);
  // The library imports return the constructors — we don't rely on the
  // `google.maps.Marker`/`Geocoder` GLOBALS being populated (with the modern
  // `importLibrary` loader they aren't, unless their library was imported).
  const markerCtorRef = useRef<GoogleMarkerCtor | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const placeCtorRef = useRef<GooglePlaceCtor | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unavailable'>(
    apiKey ? 'loading' : 'unavailable',
  );
  const [mapOpen, setMapOpen] = useState(false);

  // Keep onSelect current without re-running the load effects (which would tear
  // down + recreate the autocomplete element on every parent render).
  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Place/move the marker; optionally recenter the map on it.
  const syncMarker = (lat: number, lng: number, pan: boolean) => {
    if (!mapRef.current || !markerCtorRef.current) return;
    if (!markerRef.current) {
      markerRef.current = new markerCtorRef.current({ map: mapRef.current, position: { lat, lng } });
    } else {
      markerRef.current.setPosition({ lat, lng });
    }
    if (pan) {
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(SELECTED_ZOOM);
    }
  };

  // POI tap → resolve the clicked place by its id to its REAL name + canonical
  // location (so the marker snaps onto the place, and the address reads e.g.
  // "Banyan Tree" — not a nearby street). Mirrors the FMS "target capture".
  const pickFromPlaceId = async (placeId: string, fallbackLat?: number, fallbackLng?: number) => {
    const PlaceCtor = placeCtorRef.current;
    if (!PlaceCtor) {
      // Places lib unavailable — fall back to reverse-geocoding the click point.
      if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
      return;
    }
    try {
      const place = new PlaceCtor({ id: placeId });
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName', 'id'] });
      if (!place.location) {
        if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
        return;
      }
      const lat = place.location.lat();
      const lng = place.location.lng();
      syncMarker(lat, lng, true);
      onSelectRef.current({
        address: place.formattedAddress || place.displayName || '',
        lat,
        lng,
        place_id: place.id,
        name: place.displayName,
      });
    } catch {
      if (fallbackLat != null && fallbackLng != null) pickFromMap(fallbackLat, fallbackLng);
    }
  };

  // Map tap → place marker + reverse-geocode to a human-readable address.
  const pickFromMap = (lat: number, lng: number) => {
    syncMarker(lat, lng, true);
    if (!geocoderRef.current) {
      // No Geocoding API (library import failed / API not enabled on the key)
      // — submit raw coordinates (backend accepts a place_id-less location;
      // address just has to be non-empty).
      onSelectRef.current({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng });
      return;
    }
    geocoderRef.current.geocode({ location: { lat, lng } }, (results, gstatus) => {
      if (gstatus === 'OK' && results?.[0]) {
        onSelectRef.current({
          address: results[0].formatted_address || `${lat.toFixed(6)}, ${lng.toFixed(6)}`,
          lat,
          lng,
          place_id: results[0].place_id,
        });
      } else {
        onSelectRef.current({ address: `${lat.toFixed(6)}, ${lng.toFixed(6)}`, lat, lng });
      }
    });
  };

  // 1. Load the Places autocomplete web component.
  useEffect(() => {
    if (!apiKey || !acContainerRef.current) {
      if (!apiKey) setStatus('unavailable');
      return;
    }
    let cancelled = false;
    let element: GooglePlaceAutocompleteElement | null = null;
    let listener: GmpSelectListener | null = null;

    (async () => {
      try {
        const google = window.google;
        if (!google) throw new Error('Google Maps bootstrap loader missing');
        const { PlaceAutocompleteElement, Place } = await google.maps.importLibrary('places');
        if (cancelled || !acContainerRef.current || !PlaceAutocompleteElement) return;
        placeCtorRef.current = Place ?? null; // used to resolve POI map clicks

        element = new PlaceAutocompleteElement();
        acContainerRef.current.appendChild(element as unknown as Node);

        listener = async ({ placePrediction }) => {
          try {
            const place = placePrediction.toPlace();
            await place.fetchFields({ fields: ['formattedAddress', 'location', 'id', 'displayName'] });
            if (!place.location) return; // no coordinates — nothing we can submit
            const lat = place.location.lat();
            const lng = place.location.lng();
            onSelectRef.current({
              address: place.formattedAddress || place.displayName || '',
              lat,
              lng,
              place_id: place.id,
              name: place.displayName,
            });
            syncMarker(lat, lng, true); // reflect the choice on the map if it's open
          } catch {
            // fetchFields rejected (network blip / quota / revoked field
            // access) — swallow rather than leak an unhandled rejection; the
            // user can pick the suggestion again or fall back to the map.
          }
        };
        element.addEventListener('gmp-select', listener);
        setStatus('ready');
      } catch {
        if (!cancelled) setStatus('error');
      }
    })();

    return () => {
      cancelled = true;
      if (element && listener) element.removeEventListener('gmp-select', listener);
      (element as unknown as ChildNode | null)?.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // 2. Lazily initialise the map the first time it's opened.
  useEffect(() => {
    if (!mapOpen || !apiKey || !mapDivRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const google = window.google;
        if (!google) return;
        // Import each library explicitly and use the returned constructors —
        // the modern loader does NOT populate the `google.maps.*` globals for
        // libraries you didn't import. marker → legacy Marker (works without a
        // mapId, unlike AdvancedMarkerElement); geocoding → Geocoder.
        const [maps, marker, geocoding] = await Promise.all([
          google.maps.importLibrary('maps'),
          google.maps.importLibrary('marker'),
          google.maps.importLibrary('geocoding').catch(() => null), // Geocoding API optional
        ]);
        if (cancelled || !mapDivRef.current || !maps.Map) return;
        markerCtorRef.current = marker.Marker ?? null;
        if (geocoding?.Geocoder) geocoderRef.current = new geocoding.Geocoder();
        const center = value ? { lat: value.lat, lng: value.lng } : DEFAULT_CENTER;
        const map = new maps.Map(mapDivRef.current, {
          center,
          zoom: value ? SELECTED_ZOOM : DEFAULT_ZOOM,
          disableDefaultUI: true,
          zoomControl: true,
          // clickableIcons ON (default) so a tap on a POI icon carries its
          // placeId — we resolve that to the real place instead of a nearby
          // street address (see the click handler below).
        });
        mapRef.current = map;
        if (value) syncMarker(value.lat, value.lng, false);
        map.addListener('click', (e) => {
          if (e.placeId) {
            // A POI was tapped — capture that place, and suppress Google's
            // default info window.
            e.stop?.();
            pickFromPlaceId(e.placeId, e.latLng?.lat(), e.latLng?.lng());
          } else if (e.latLng) {
            // Empty-map tap — drop a pin and reverse-geocode the point.
            pickFromMap(e.latLng.lat(), e.latLng.lng());
          }
        });
      } catch {
        // Map failed to load (e.g. Maps JS unavailable) — the search field
        // still works; don't surface a hard error for the optional map.
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOpen, apiKey]);

  // Keep the marker in sync when the value changes from outside the map (search
  // selection, or a parent reset).
  useEffect(() => {
    if (mapRef.current && value) syncMarker(value.lat, value.lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  if (status === 'unavailable') {
    return <p className="sb-vd__addr-msg">{strings.unavailable}</p>;
  }

  return (
    <div className="sb-vd__addr-picker-inner">
      <div ref={acContainerRef} data-testid="delivery-address-picker-container" />
      {status === 'loading' && <p className="sb-vd__addr-msg">{strings.loading}</p>}
      {status === 'error' && <p className="sb-vd__addr-msg sb-vd__addr-msg--err">{strings.unavailable}</p>}
      {status === 'ready' ? (
        <>
          <button
            type="button"
            className="sb-vd__addr-map-toggle"
            aria-expanded={mapOpen}
            onClick={() => setMapOpen((v) => !v)}
          >
            📍 {mapOpen ? strings.hideMap : strings.showMap}
          </button>
          {mapOpen ? (
            <div className="sb-vd__addr-map-wrap">
              <div ref={mapDivRef} className="sb-vd__addr-map" data-testid="delivery-address-map" />
              <p className="sb-vd__addr-map-hint">{strings.mapHint}</p>
            </div>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
