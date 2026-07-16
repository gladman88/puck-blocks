import { describe, it, expect, vi, afterEach } from 'vitest';
import { render, screen, waitFor, cleanup, fireEvent } from '@testing-library/react';
import { DeliveryAddressPicker } from './DeliveryAddressPicker';

const strings = {
  unavailable: 'Address search is temporarily unavailable',
  loading: 'Loading…',
  showMap: 'Pick on the map',
  hideMap: 'Hide map',
  mapHint: 'Tap the map to choose a point',
};

afterEach(() => {
  cleanup();
  delete window.google;
});

describe('DeliveryAddressPicker (puck-blocks)', () => {
  it('shows the unavailable message when no API key is configured', () => {
    render(<DeliveryAddressPicker apiKey={undefined} value={null} onSelect={vi.fn()} strings={strings} />);
    expect(screen.getByText(strings.unavailable)).toBeTruthy();
  });

  it('shows an error state when the Google Maps bootstrap loader is missing', async () => {
    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={vi.fn()} strings={strings} />);
    await waitFor(() => {
      expect(screen.getByText(strings.unavailable)).toBeTruthy();
    });
  });

  it('appends the PlaceAutocompleteElement and forwards a selection through onSelect', async () => {
    const onSelect = vi.fn();

    // A class whose constructor returns a REAL DOM node (a plain `class`
    // extending HTMLElement can't be `new`'d outside customElements.define
    // in jsdom) so the component's real `containerRef.current.appendChild`
    // succeeds exactly like it would with the genuine web component.
    class FakeAutocompleteElement {
      constructor() {
        return document.createElement('div');
      }
    }

    window.google = {
      maps: {
        importLibrary: vi.fn().mockResolvedValue({ PlaceAutocompleteElement: FakeAutocompleteElement }),
      },
    };

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);

    const fakeElement = await waitFor(() => {
      const container = screen.getByTestId('delivery-address-picker-container');
      const el = container.firstElementChild;
      expect(el).not.toBeNull();
      return el as HTMLDivElement;
    });

    const fakePlace = {
      formattedAddress: 'Patong Beach Road',
      displayName: 'Patong',
      id: 'place-123',
      location: { lat: () => 7.9, lng: () => 98.29 },
      fetchFields: vi.fn().mockResolvedValue(undefined),
    };
    const event = new Event('gmp-select') as Event & { placePrediction: unknown };
    event.placePrediction = { toPlace: () => fakePlace };
    fakeElement.dispatchEvent(event);

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        address: 'Patong Beach Road',
        lat: 7.9,
        lng: 98.29,
        place_id: 'place-123',
        name: 'Patong',
      }),
    );
  });

  it('opens the map and reverse-geocodes a map tap into an address through onSelect', async () => {
    const onSelect = vi.fn();

    class FakeAutocompleteElement {
      constructor() {
        return document.createElement('div');
      }
    }
    // Capture the map click handler the component registers.
    let mapClickHandler: ((e: { latLng: { lat: () => number; lng: () => number } }) => void) | null = null;
    class FakeMap {
      constructor() {
        /* container element ignored in jsdom */
      }
      panTo() {}
      setZoom() {}
      addListener(_event: string, handler: (e: { latLng: { lat: () => number; lng: () => number } }) => void) {
        mapClickHandler = handler;
      }
    }
    class FakeMarker {
      setPosition() {}
      setMap() {}
    }
    class FakeGeocoder {
      geocode(
        _req: unknown,
        cb: (results: { formatted_address: string; place_id: string }[], status: string) => void,
      ) {
        cb([{ formatted_address: 'Kata Beach, Phuket', place_id: 'geo-1' }], 'OK');
      }
    }

    window.google = {
      maps: {
        importLibrary: vi.fn((name: string) => {
          if (name === 'places') return Promise.resolve({ PlaceAutocompleteElement: FakeAutocompleteElement });
          if (name === 'marker') return Promise.resolve({ Marker: FakeMarker });
          if (name === 'geocoding') return Promise.resolve({ Geocoder: FakeGeocoder });
          return Promise.resolve({ Map: FakeMap });
        }),
      },
    } as unknown as typeof window.google;

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);

    // Wait for the autocomplete to be ready, then open the map.
    const toggle = await screen.findByText(/Pick on the map/);
    fireEvent.click(toggle);
    await screen.findByTestId('delivery-address-map');

    await waitFor(() => expect(mapClickHandler).not.toBeNull());
    mapClickHandler!({ latLng: { lat: () => 7.82, lng: () => 98.3 } });

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({
        address: 'Kata Beach, Phuket',
        lat: 7.82,
        lng: 98.3,
        place_id: 'geo-1',
      }),
    );
  });

  it('falls back to raw coordinates on a map tap when the Geocoder is unavailable', async () => {
    const onSelect = vi.fn();

    class FakeAutocompleteElement {
      constructor() {
        return document.createElement('div');
      }
    }
    let mapClickHandler: ((e: { latLng: { lat: () => number; lng: () => number } }) => void) | null = null;
    class FakeMap {
      panTo() {}
      setZoom() {}
      addListener(_event: string, handler: (e: { latLng: { lat: () => number; lng: () => number } }) => void) {
        mapClickHandler = handler;
      }
    }
    class FakeMarker {
      setPosition() {}
      setMap() {}
    }

    window.google = {
      maps: {
        importLibrary: vi.fn((name: string) => {
          if (name === 'places') return Promise.resolve({ PlaceAutocompleteElement: FakeAutocompleteElement });
          if (name === 'marker') return Promise.resolve({ Marker: FakeMarker });
          if (name === 'geocoding') return Promise.resolve({}); // no Geocoder → raw-coord fallback
          return Promise.resolve({ Map: FakeMap });
        }),
      },
    } as unknown as typeof window.google;

    render(<DeliveryAddressPicker apiKey="test-key" value={null} onSelect={onSelect} strings={strings} />);
    fireEvent.click(await screen.findByText(/Pick on the map/));
    await screen.findByTestId('delivery-address-map');
    await waitFor(() => expect(mapClickHandler).not.toBeNull());
    mapClickHandler!({ latLng: { lat: () => 7.82, lng: () => 98.3 } });

    await waitFor(() =>
      expect(onSelect).toHaveBeenCalledWith({ address: '7.820000, 98.300000', lat: 7.82, lng: 98.3 }),
    );
  });
});
