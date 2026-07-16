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
const DEBOUNCE_MS = 250;

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
type GooglePlaceCtor = new (opts: { id: string }) => GooglePlace;
interface GoogleFormattableText {
  text?: string;
  toString: () => string;
}
interface GooglePlacePrediction {
  toPlace: () => GooglePlace;
  text: GoogleFormattableText;
  mainText?: GoogleFormattableText;
  secondaryText?: GoogleFormattableText;
}
interface GoogleAutocompleteSuggestion {
  placePrediction: GooglePlacePrediction | null;
}
interface GoogleAutocompleteSuggestionApi {
  fetchAutocompleteSuggestions: (request: {
    input: string;
    sessionToken?: object;
  }) => Promise<{ suggestions: GoogleAutocompleteSuggestion[] }>;
}
interface GoogleMapMouseEvent {
  latLng?: GoogleLatLng | null;
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
    AutocompleteSuggestion?: GoogleAutocompleteSuggestionApi;
    AutocompleteSessionToken?: new () => object;
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
  /** The currently-picked location — shown IN the search input (like the FMS
   *  picker) and reflected on the map marker. */
  value: PickedLocation | null;
  onSelect: (location: PickedLocation) => void;
  strings: {
    unavailable: string;
    loading: string;
    searchPlaceholder: string;
    /** "Выбрать на карте" — expands the inline map. */
    showMap: string;
    /** "Скрыть карту". */
    hideMap: string;
    /** "Нажмите на карту, чтобы выбрать точку". */
    mapHint: string;
  };
}

/** What to show in the input for a picked location: the place name when it has
 *  one (a searched/POI place reads as "Banyan Tree"), else the address. */
function displayValue(loc: PickedLocation | null): string {
  if (!loc) return '';
  return loc.name || loc.address;
}

/**
 * Google Places address picker (Stage 6) — mirrors the FMS location picker
 * (`frontend_fms/src/components/location-picker.tsx`): ONE input that shows the
 * typed query AND the selected address, an autocomplete dropdown, and an
 * expandable map where tapping a POI captures that place (or an empty point is
 * reverse-geocoded). Built framework-neutral on the RAW Google Maps JS API
 * (`importLibrary`) — NOT `@react-google-maps/api`.
 *
 * Uses the modern `AutocompleteSuggestion` API (the legacy `Autocomplete`
 * widget the FMS uses is closed to API keys enabled after March 2025), driving
 * our OWN controlled input — so, unlike the `PlaceAutocompleteElement` web
 * component, the selection can live in the input itself. The map tap path needs
 * the **Geocoding API** for the reverse-geocode of empty points; if it isn't
 * enabled a tap still works and falls back to a `"lat, lng"` address.
 */
export function DeliveryAddressPicker({ apiKey, value, onSelect, strings }: DeliveryAddressPickerProps) {
  const [query, setQuery] = useState<string>(() => displayValue(value));
  const [suggestions, setSuggestions] = useState<GooglePlacePrediction[]>([]);
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unavailable'>(
    apiKey ? 'loading' : 'unavailable',
  );
  const [mapOpen, setMapOpen] = useState(false);

  const suggestApiRef = useRef<GoogleAutocompleteSuggestionApi | null>(null);
  const sessionTokenCtorRef = useRef<(new () => object) | null>(null);
  const sessionTokenRef = useRef<object | null>(null);
  const placeCtorRef = useRef<GooglePlaceCtor | null>(null);
  const mapDivRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<GoogleMap | null>(null);
  const markerRef = useRef<GoogleMapMarker | null>(null);
  const markerCtorRef = useRef<GoogleMarkerCtor | null>(null);
  const geocoderRef = useRef<GoogleGeocoder | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onSelectRef = useRef(onSelect);
  useEffect(() => {
    onSelectRef.current = onSelect;
  }, [onSelect]);

  // Reflect an externally-changed value (a completed selection routed through
  // the parent, or a reset) into the input — WITHOUT re-triggering a fetch
  // (fetch happens only on user typing, in onInputChange). Keyed on coords so
  // plain typing (value unchanged) never clobbers what the user is writing.
  useEffect(() => {
    setQuery(displayValue(value));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  const newSessionToken = () => {
    sessionTokenRef.current = sessionTokenCtorRef.current ? new sessionTokenCtorRef.current() : null;
  };

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
  // location (so the marker snaps onto the place, and the input reads e.g.
  // "Banyan Tree" — not a nearby street). Mirrors the FMS "target capture".
  const pickFromPlaceId = async (placeId: string, fallbackLat?: number, fallbackLng?: number) => {
    const PlaceCtor = placeCtorRef.current;
    if (!PlaceCtor) {
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

  // Empty-map tap → drop a pin + reverse-geocode to a human-readable address.
  const pickFromMap = (lat: number, lng: number) => {
    syncMarker(lat, lng, true);
    if (!geocoderRef.current) {
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

  // Resolve a chosen autocomplete prediction to a full place → onSelect.
  const selectPrediction = async (prediction: GooglePlacePrediction) => {
    setOpen(false);
    try {
      const place = prediction.toPlace();
      await place.fetchFields({ fields: ['location', 'formattedAddress', 'displayName', 'id'] });
      if (!place.location) return;
      const lat = place.location.lat();
      const lng = place.location.lng();
      onSelectRef.current({
        address: place.formattedAddress || place.displayName || '',
        lat,
        lng,
        place_id: place.id,
        name: place.displayName,
      });
      syncMarker(lat, lng, true);
      newSessionToken(); // a completed selection ends the billing session
    } catch {
      /* ignore — the user can pick again or use the map */
    }
  };

  // 1. Load the Places library (suggestions + Place + session token).
  useEffect(() => {
    if (!apiKey) {
      setStatus('unavailable');
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const google = window.google;
        if (!google) throw new Error('Google Maps bootstrap loader missing');
        const { AutocompleteSuggestion, AutocompleteSessionToken, Place } =
          await google.maps.importLibrary('places');
        if (cancelled) return;
        if (!AutocompleteSuggestion) throw new Error('AutocompleteSuggestion unavailable');
        suggestApiRef.current = AutocompleteSuggestion;
        sessionTokenCtorRef.current = AutocompleteSessionToken ?? null;
        placeCtorRef.current = Place ?? null;
        newSessionToken();
        setStatus('ready');
      } catch (err) {
        // Surface WHY search couldn't init (missing key / API not enabled /
        // AutocompleteSuggestion unavailable) — otherwise the user only sees
        // "temporarily unavailable" with no clue.
        // eslint-disable-next-line no-console
        console.error('[DeliveryAddressPicker] Google Places init failed:', err);
        if (!cancelled) setStatus('error');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [apiKey]);

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const q = e.target.value;
    setQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const api = suggestApiRef.current;
    if (!q.trim() || !api) {
      setSuggestions([]);
      setOpen(false);
      return;
    }
    debounceRef.current = setTimeout(async () => {
      try {
        const { suggestions: raw } = await api.fetchAutocompleteSuggestions({
          input: q,
          ...(sessionTokenRef.current ? { sessionToken: sessionTokenRef.current } : {}),
        });
        const preds = (raw ?? [])
          .map((s) => s.placePrediction)
          .filter((p): p is GooglePlacePrediction => p != null);
        setSuggestions(preds);
        setOpen(preds.length > 0);
      } catch {
        setSuggestions([]);
        setOpen(false);
      }
    }, DEBOUNCE_MS);
  };

  // 2. Lazily initialise the map the first time it's opened.
  useEffect(() => {
    if (!mapOpen || !apiKey || !mapDivRef.current || mapRef.current) return;
    let cancelled = false;
    (async () => {
      try {
        const google = window.google;
        if (!google) return;
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
          // clickableIcons ON (default) so a POI-icon tap carries its placeId.
        });
        mapRef.current = map;
        if (value) syncMarker(value.lat, value.lng, false);
        map.addListener('click', (e) => {
          if (e.placeId) {
            e.stop?.();
            pickFromPlaceId(e.placeId, e.latLng?.lat(), e.latLng?.lng());
          } else if (e.latLng) {
            pickFromMap(e.latLng.lat(), e.latLng.lng());
          }
        });
      } catch {
        /* map failed to load — the search input still works */
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mapOpen, apiKey]);

  // Keep the marker in sync when the value changes from outside the map.
  useEffect(() => {
    if (mapRef.current && value) syncMarker(value.lat, value.lng, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value?.lat, value?.lng]);

  if (status === 'error' || status === 'unavailable') {
    // Search couldn't initialise (no key / Places API not enabled / library
    // unavailable). Don't show a dead empty input — surface the already-picked
    // value read-only if there is one, otherwise just the reason.
    return (
      <div className="sb-vd__addr-picker-inner">
        {value ? (
          <input
            className="sb-input"
            value={query}
            disabled
            aria-label={strings.searchPlaceholder}
            data-testid="delivery-address-input"
          />
        ) : (
          <p className="sb-vd__addr-msg sb-vd__addr-msg--err">{strings.unavailable}</p>
        )}
      </div>
    );
  }

  return (
    <div className="sb-vd__addr-picker-inner">
      <div className="sb-vd__addr-search">
        <input
          className="sb-input"
          type="text"
          value={query}
          disabled={status !== 'ready'}
          placeholder={strings.searchPlaceholder}
          onChange={onInputChange}
          onFocus={() => suggestions.length > 0 && setOpen(true)}
          // Delay so a suggestion's onClick lands before the list closes.
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          aria-label={strings.searchPlaceholder}
          data-testid="delivery-address-input"
        />
        {open && suggestions.length > 0 ? (
          <ul className="sb-vd__addr-suggest" data-testid="delivery-address-suggestions">
            {suggestions.map((p, i) => (
              <li key={i}>
                <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => selectPrediction(p)}>
                  <span className="sb-vd__addr-suggest-main">{p.mainText?.text ?? p.text.toString()}</span>
                  {p.secondaryText?.text ? (
                    <span className="sb-vd__addr-suggest-sub">{p.secondaryText.text}</span>
                  ) : null}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
      {status === 'loading' && <p className="sb-vd__addr-msg">{strings.loading}</p>}
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
