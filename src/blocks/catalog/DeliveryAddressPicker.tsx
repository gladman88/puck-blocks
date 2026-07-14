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

// Minimal ambient shape for the pieces of the Google Maps JS API this file
// touches — puck-blocks has no @types/google.maps dependency (this is the
// first Google Maps integration in this repo), so a full typed surface isn't
// worth adding for one component. `google` itself comes from the host page's
// bootstrap loader script (see the site/FMS layout that renders this block).
interface GooglePlace {
  formattedAddress?: string;
  displayName?: string;
  id?: string;
  location?: { lat: () => number; lng: () => number };
  fetchFields: (opts: { fields: string[] }) => Promise<void>;
}
interface GooglePlacePrediction {
  toPlace: () => GooglePlace;
}
type GmpSelectListener = (event: { placePrediction: GooglePlacePrediction }) => void;
// Deliberately NOT `extends HTMLElement` — the real element IS one (it's a
// custom element instance), but typing addEventListener/removeEventListener
// with a non-standard event name conflicts with HTMLElement's own overloads.
// DOM insertion/removal below casts through `unknown` instead.
interface GooglePlaceAutocompleteElement {
  addEventListener: (type: 'gmp-select', listener: GmpSelectListener) => void;
  removeEventListener: (type: 'gmp-select', listener: GmpSelectListener) => void;
}
declare global {
  interface Window {
    google?: {
      maps: {
        importLibrary: (name: string) => Promise<{
          PlaceAutocompleteElement: new () => GooglePlaceAutocompleteElement;
        }>;
      };
    };
  }
}

interface DeliveryAddressPickerProps {
  /** Empty/undefined → the picker never attempts to load (no key configured
   *  for this deployment yet). Shows `unavailableText` instead. */
  apiKey: string | undefined;
  onSelect: (location: PickedLocation) => void;
  unavailableText: string;
  loadingText: string;
}

/**
 * Google Places address picker (Stage 6, plan §Stage 6) — a thin wrapper
 * around the modern `PlaceAutocompleteElement` web component (the legacy
 * `Autocomplete` class is closed to API keys enabled after March 2025, so a
 * brand-new public key for the site domain would likely be unable to use it
 * at all). Mirrors frontend_catalog's `DeliveryAddressPicker` 1:1; kept
 * separate (not shared) because puck-blocks is framework-neutral / has its
 * own `sb-` CSS and no dependency on frontend_catalog's build.
 */
export function DeliveryAddressPicker({ apiKey, onSelect, unavailableText, loadingText }: DeliveryAddressPickerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error' | 'unavailable'>(
    apiKey ? 'loading' : 'unavailable',
  );

  useEffect(() => {
    if (!apiKey || !containerRef.current) return;
    let cancelled = false;
    let element: GooglePlaceAutocompleteElement | null = null;
    let listener: ((event: { placePrediction: GooglePlacePrediction }) => void) | null = null;

    (async () => {
      try {
        const google = window.google;
        if (!google) throw new Error('Google Maps bootstrap loader missing');
        const { PlaceAutocompleteElement } = await google.maps.importLibrary('places');
        if (cancelled || !containerRef.current) return;

        element = new PlaceAutocompleteElement();
        containerRef.current.appendChild(element as unknown as Node);

        listener = async ({ placePrediction }) => {
          const place = placePrediction.toPlace();
          await place.fetchFields({ fields: ['formattedAddress', 'location', 'id', 'displayName'] });
          if (!place.location) return; // no coordinates — nothing we can submit
          onSelect({
            address: place.formattedAddress || place.displayName || '',
            lat: place.location.lat(),
            lng: place.location.lng(),
            place_id: place.id,
            name: place.displayName,
          });
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

  if (status === 'unavailable') {
    return <p className="sb-vd__addr-msg">{unavailableText}</p>;
  }

  return (
    <div>
      <div ref={containerRef} data-testid="delivery-address-picker-container" />
      {status === 'loading' && <p className="sb-vd__addr-msg">{loadingText}</p>}
      {status === 'error' && <p className="sb-vd__addr-msg sb-vd__addr-msg--err">{unavailableText}</p>}
    </div>
  );
}
